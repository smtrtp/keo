package com.kaomoji.keyboard

/** One letter key: letter, glyph, reading (syllable name), description. */
data class Glyph(val letter: String, val glyph: String, val reading: String, val desc: String)

object Data {
    val CIPHER = listOf(
        Glyph("A", "ʘ", "Vok", "Sharp click + high whistle"),
        Glyph("B", "益", "Grak", "Guttural throat growl"),
        Glyph("C", "◕", "Mee", "Soft exhaled hum"),
        Glyph("D", "σ", "Zuu", "Vibrating hum"),
        Glyph("E", "✧", "Kee", "High crisp pop"),
        Glyph("F", "இ", "Thal", "Rolling tongue-click"),
        Glyph("G", "ω", "Ohm", "Purr-like low resonance"),
        Glyph("H", "∀", "Kha", "Sharp exhaled snap"),
        Glyph("I", "﹏", "Vra", "Low tremolo rhythm"),
        Glyph("J", "༚", "Nii", "Soft inhalation"),
        Glyph("K", "Д", "Rokh", "Heavy impact exhale"),
        Glyph("L", "づ", "Lyu", "Sliding glissando"),
        Glyph("M", "(", "Os", "Enclosed silence (left)"),
        Glyph("N", ")", "Os", "Enclosed silence (right)"),
        Glyph("O", "♡", "Vra", "Dual heart-thump pulse"),
        Glyph("P", "⊂", "Kor", "Low resonant echo shield (left)"),
        Glyph("Q", "⊃", "Kor", "Low resonant echo shield (right)"),
        Glyph("R", "୧", "Bak", "Heavy snapped inhale"),
        Glyph("S", "◔", "Sii", "Soft sibilant slide"),
        Glyph("T", "ಠ", "Thok", "Dry tongue tap"),
        Glyph("U", "ᴗ", "Uum", "Closed-lip rounded hum"),
        Glyph("V", "▽", "Vell", "Bright rising lilt"),
        Glyph("W", "╯", "Wao", "Breathy open wow"),
        Glyph("X", "╰", "Xir", "Sharp metallic rasp"),
        Glyph("Y", "✿", "Yen", "Sing-song upward note"),
        Glyph("Z", "★", "Zol", "Deep buzzing drone")
    )
    val BY_LETTER: Map<String, Glyph> = CIPHER.associateBy { it.letter }
    val BY_GLYPH: Map<String, Glyph> = CIPHER.associateBy { it.glyph }

    /** digit, glyph, name */
    val NUMBERS = listOf(
        Triple("1", "⚀", "Ena"), Triple("2", "⚁", "Duo"), Triple("3", "⚂", "Tre"),
        Triple("4", "⚃", "Kua"), Triple("5", "⚄", "Pen"), Triple("6", "⚅", "Hex"),
        Triple("7", "◐", "Sep"), Triple("8", "◑", "Okt"), Triple("9", "◒", "Non"),
        Triple("0", "○", "Nul")
    )
    val NUM_BY_GLYPH: Map<String, Triple<String, String, String>> = NUMBERS.associateBy { it.second }

    val EYES = listOf("ʘ","◕","●","◔","◉","⊙","✧","ಠ","ಥ","╥","ᵔ","˘","≧","≦","⌒","°","・","^","T","இ","σ","•","｡","－")
    val MOUTHS = listOf("ω","∀","▽","‿","﹏","Д","ᴗ","□","ε","益","ー","ᗨ","ᴥ","෴","༚","﹃","〇","_")
    val ARMS = listOf("(",")","⊂","⊃","づ","ノ","ﾉ","ヽ","╯","╰","٩","۶","੭","ଘ","☞","ง","ʕ","ʔ","/","\\","ᕕ","ᕗ")
    val EXTRAS = listOf("♡","♥","✿","★","☆","*","~","♪","!","?","…","💢","💧","✨",";","〃","꒰","꒱","₍","₎","·",",",".","´","`","┻━┻","︵")
    val PART_SETS = linkedMapOf("Eyes" to EYES, "Mouths" to MOUTHS, "Arms" to ARMS, "Extras" to EXTRAS)

    val FACES = listOf(
        "(◕ω◕)","(｡♥‿♥｡)","(≧▽≦)","(ಥ﹏ಥ)","(づ｡◕‿‿◕｡)づ","(⌒‿⌒)","ヽ(°〇°)ﾉ","(；´Д｀)","(¬‿¬)",
        "٩(◕‿◕)۶","(ᵔᴥᵔ)","ʕ•ᴥ•ʔ","(*^▽^*)","(－_－) zzz","(╯°□°)╯︵ ┻━┻","¯\\_(ツ)_/¯",
        "(ง •̀_•́)ง","(☞ﾟヮﾟ)☞","(ʘ益ʘ)","(✧ω✧)"
    )
    val PHRASES = listOf(
        "(益∀)" to "Fierce, protective love. Unyielding loyalty.",
        "♡(σω)♡" to "She is so cute when she is sleepy.",
        "୧(ʘ﹏)୨" to "Captivated focus. Helplessly in love."
    )
    /** mark, name. Full stop is ◦ and comma is ・ */
    val MARKS = listOf(
        "◦" to "Full stop", "・" to "Comma", "⁇" to "Question mark", "‼" to "Exclamation mark",
        "…" to "Ellipsis", "〜" to "Wave", "「" to "Open quote", "」" to "Close quote",
        "‥" to "Pause", "※" to "Note", "⁂" to "Break", "♪" to "Tune"
    )

    /** Reading of a string: syllable names joined with '-', silent (Os) glyphs skipped. */
    fun reading(text: String): String {
        val out = ArrayList<String>()
        var i = 0
        while (i < text.length) {
            val cp = text.codePointAt(i)
            val ch = String(Character.toChars(cp))
            i += Character.charCount(cp)
            val g = BY_GLYPH[ch]
            if (g != null) { if (g.reading != "Os") out.add(g.reading); continue }
            val n = NUM_BY_GLYPH[ch]
            if (n != null) out.add(n.third)
        }
        return out.joinToString("-")
    }
}
