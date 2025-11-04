/**
 * Get a color class from a cycling palette based on index
 */
export function getCycleColor(index: number, paletteName: 'default' | 'alt' = 'default'): string {
    const palettes = {
        default: [
            'text-purple-600 bg-purple-50',
            'text-blue-600 bg-blue-50',
            'text-teal-600 bg-teal-50',
            'text-orange-600 bg-orange-50',
            'text-pink-600 bg-pink-50',
            'text-indigo-600 bg-indigo-50',
        ],
        alt: [
            'text-emerald-600 bg-emerald-50',
            'text-sky-600 bg-sky-50',
            'text-violet-600 bg-violet-50',
            'text-amber-600 bg-amber-50',
            'text-rose-600 bg-rose-50',
            'text-cyan-600 bg-cyan-50',
        ],
    }

    const palette = palettes[paletteName]
    return palette[index % palette.length]
}
