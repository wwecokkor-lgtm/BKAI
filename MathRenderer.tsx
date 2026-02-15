import React, { useMemo, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';

interface MathRendererProps {
  content: string;
  className?: string;
}

export const MathRenderer: React.FC<MathRendererProps> = ({ content, className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Pre-process content to normalize LaTeX delimiters and fix common AI formatting issues
  const processedContent = useMemo(() => {
    if (!content) return '';
    
    let fixed = content;
    const placeholders: string[] = [];
    const inlinePlaceholders: string[] = [];

    // 1. Temporarily hide valid Block Math ($$ ... $$) to protect them from regex replacements
    fixed = fixed.replace(/\$\$([\s\S]*?)\$\$/g, (match) => {
        placeholders.push(match);
        return `%%%MATH_BLOCK_${placeholders.length - 1}%%%`;
    });

    // 2. Temporarily hide valid Inline Math ($ ... $)
    fixed = fixed.replace(/(?<!\\)\$([^\$]+?)(?<!\\)\$/g, (match) => {
        inlinePlaceholders.push(match);
        return `%%%MATH_INLINE_${inlinePlaceholders.length - 1}%%%`;
    });

    // --- FIXES FOR NAKED LATEX (Common in AI responses) ---

    // 3. Fix "def\arraystretch" typo (missing backslash) -> "\def\arraystretch"
    fixed = fixed.replace(/(^|[^\\a-zA-Z])def\\arraystretch/g, '$1\\def\\arraystretch');

    // 4. Wrap naked "\def\arraystretch ... \end{array}" blocks in $$ ... $$ (Aggressive whitespace handling)
    fixed = fixed.replace(/(\\def\s*\\arraystretch(?:.|\s)*?\\end\s*\{\s*array\s*\})/g, (match) => {
        return `\n$$\n${match}\n$$\n`;
    });

    // 5. Wrap naked "\begin{array} ... \end{array}" blocks in $$ ... $$
    fixed = fixed.replace(/(\\begin\s*\{\s*array\s*\}(?:.|\s)*?\\end\s*\{\s*array\s*\})/g, (match) => {
        return `\n$$\n${match}\n$$\n`;
    });

    // 6. Convert \[ ... \] to $$ ... $$ (Display Math)
    fixed = fixed.replace(/\\\[([\s\S]*?)\\\]/g, '\n$$$1$$\n');
    
    // 7. Convert \( ... \) to $ ... $ (Inline Math)
    fixed = fixed.replace(/\\\(([\s\S]*?)\\\)/g, '$$$1$$');

    // 8. Restore placeholders
    fixed = fixed.replace(/%%%MATH_BLOCK_(\d+)%%%/g, (_, index) => placeholders[parseInt(index)]);
    fixed = fixed.replace(/%%%MATH_INLINE_(\d+)%%%/g, (_, index) => inlinePlaceholders[parseInt(index)]);

    return fixed;
  }, [content]);

  // Trigger MathJax Typeset when content changes
  useEffect(() => {
    let isMounted = true;
    
    const typeset = async () => {
       if (!containerRef.current) return;

       // Check if MathJax is loaded and ready
       if (typeof (window as any).MathJax !== 'undefined' && (window as any).MathJax.typesetPromise) {
           try {
               // Clear existing MathJax processing marks
               if ((window as any).MathJax.typesetClear) {
                  (window as any).MathJax.typesetClear([containerRef.current]);
               }
               // Remove rendered frames to prevent duplication
               const mathElements = containerRef.current.querySelectorAll('mjx-container');
               mathElements.forEach(el => el.remove());

               // Trigger Render
               await (window as any).MathJax.typesetPromise([containerRef.current]);
           } catch (e) {
               console.warn('MathJax typesetting failed:', e);
           }
       } else {
           // Retry if MathJax isn't ready yet (race condition fix)
           if (isMounted) setTimeout(typeset, 500);
       }
    };
    
    typeset();

    return () => { isMounted = false; };
  }, [processedContent]);

  return (
    <div 
      ref={containerRef}
      className={`prose prose-indigo max-w-none font-bangla prose-p:leading-loose ${className}`}
    >
      <ReactMarkdown 
        remarkPlugins={[remarkGfm, remarkMath]}
        components={{
            // Render Math Blocks
            math: ({node}) => {
                const tex = node.value;
                return (
                   <div className="my-6 w-full overflow-x-auto overflow-y-hidden text-center">
                     {'$$' + tex + '$$'}
                   </div>
                );
            },
            // Render Inline Math
            inlineMath: ({node}) => {
                const tex = node.value;
                return <span className="mx-1 font-serif">{'$$' + tex + '$$'}</span>;
            },
            // Render Paragraphs (ensure text wraps nicely around math)
            p: ({children}) => {
                return <p className="mb-4 leading-8 text-slate-800 break-words">{children}</p>;
            }
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
};