import { useEffect, useState } from 'react'

interface TypewriterTextProps {
    texts: string[]
    className?: string
    style?: React.CSSProperties
}

export function TypewriterText({ texts, className = '', style = {} }: TypewriterTextProps) {
    const [currentTextIndex, setCurrentTextIndex] = useState(0)
    const [currentText, setCurrentText] = useState('')
    const [isDeleting, setIsDeleting] = useState(false)
    const [showCursor, setShowCursor] = useState(true)

    useEffect(() => {
        const fullText = texts[currentTextIndex]
        const timeout = setTimeout(
            () => {
                if (!isDeleting) {
                    if (currentText.length < fullText.length) {
                        setCurrentText(fullText.substring(0, currentText.length + 1))
                    } else {
                        setTimeout(() => setIsDeleting(true), 2000)
                    }
                } else {
                    if (currentText.length > 0) {
                        setCurrentText(fullText.substring(0, currentText.length - 1))
                    } else {
                        setIsDeleting(false)
                        setCurrentTextIndex((currentTextIndex + 1) % texts.length)
                    }
                }
            },
            isDeleting ? 50 : 100,
        )

        return () => clearTimeout(timeout)
    }, [currentText, isDeleting, currentTextIndex, texts])

    useEffect(() => {
        const cursorInterval = setInterval(() => {
            setShowCursor(prev => !prev)
        }, 530)

        return () => clearInterval(cursorInterval)
    }, [])

    return (
        <span className={className} style={style}>
            {currentText}
            <span
                className="inline-block w-1 ml-1"
                style={{
                    opacity: showCursor ? 1 : 0,
                    backgroundColor: 'currentColor',
                    transition: 'opacity 0.1s',
                }}
            >
                |
            </span>
        </span>
    )
}
