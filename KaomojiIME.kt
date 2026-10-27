package com.kaomoji.keyboard

import android.content.Context
import android.content.SharedPreferences
import android.content.res.Configuration
import android.graphics.Color
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
import android.inputmethodservice.InputMethodService
import android.os.Handler
import android.os.Looper
import android.speech.tts.TextToSpeech
import android.view.Gravity
import android.view.HapticFeedbackConstants
import android.view.MotionEvent
import android.view.View
import android.view.ViewGroup
import android.view.inputmethod.EditorInfo
import android.widget.FrameLayout
import android.widget.GridLayout
import android.widget.HorizontalScrollView
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.TextView
import java.util.Locale

class KaomojiIME : InputMethodService() {

    private lateinit var prefs: SharedPreferences
    private val handler = Handler(Looper.getMainLooper())
    private var tts: TextToSpeech? = null
    private var ttsReady = false

    private lateinit var root: LinearLayout
    private lateinit var hintView: TextView
    private lateinit var readView: TextView
    private lateinit var panel: FrameLayout
    private lateinit var tabRow: LinearLayout
    private var current = "ABC"

    private class Pal(
        val kb: Int, val key: Int, val spec: Int, val ink: Int, val mute: Int,
        val accent: Int, val on: Int, val line: Int
    )

    private fun pal(): Pal {
        val theme = prefs.getString("theme", "auto")
        val night = when (theme) {
            "dark" -> true
            "light" -> false
            else -> (resources.configuration.uiMode and Configuration.UI_MODE_NIGHT_MASK) == Configuration.UI_MODE_NIGHT_YES
        }
        return if (night)
            Pal(0xFF17181A.toInt(), 0xFF3C4043.toInt(), 0xFF2A2C2F.toInt(), 0xFFE8EAED.toInt(),
                0xFF9AA0A6.toInt(), 0xFF8AB4F8.toInt(), 0xFF202124.toInt(), 0xFF34373B.toInt())
        else
            Pal(0xFFE8EAED.toInt(), 0xFFFFFFFF.toInt(), 0xFFCFD3D8.toInt(), 0xFF202124.toInt(),
                0xFF5F6368.toInt(), 0xFF1A73E8.toInt(), 0xFFFFFFFF.toInt(), 0xFFD5D8DC.toInt())
    }

    private fun dp(v: Float): Int = (v * resources.displayMetrics.density + 0.5f).toInt()
    private fun dp(v: Int): Int = dp(v.toFloat())

    override fun onCreate() {
        super.onCreate()
        prefs = getSharedPreferences("kk", Context.MODE_PRIVATE)
    }

    override fun onCreateInputView(): View {
        val p = pal()
        root = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setBackgroundColor(p.kb)
            setPadding(dp(4), 0, dp(4), dp(6))
            layoutParams = ViewGroup.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT)
        }

        // suggestion strip: last key hint | reading of text before cursor (tap to speak)
        val strip = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
        }
        hintView = TextView(this).apply {
            setTextColor(p.mute); textSize = 14f; gravity = Gravity.CENTER
            setSingleLine(true); setPadding(dp(8), 0, dp(8), 0)
            text = "Kaomojic"
        }
        readView = TextView(this).apply {
            setTextColor(p.accent); textSize = 15f; gravity = Gravity.CENTER
            typeface = Typeface.DEFAULT_BOLD
            setSingleLine(true); setPadding(dp(8), 0, dp(8), 0)
            text = "Reading"
            setOnClickListener { speakReading() }
        }
        strip.addView(hintView, LinearLayout.LayoutParams(0, dp(44), 1f))
        strip.addView(readView, LinearLayout.LayoutParams(0, dp(44), 2f))
        root.addView(strip)

        // tabs
        val tabScroll = HorizontalScrollView(this).apply { isHorizontalScrollBarEnabled = false }
        tabRow = LinearLayout(this).apply { orientation = LinearLayout.HORIZONTAL }
        tabScroll.addView(tabRow)
        root.addView(tabScroll, LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, dp(40)))

        panel = FrameLayout(this)
        root.addView(panel, LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, dp(236)))

        buildTabs()
        openTab(current)
        return root
    }

    override fun onStartInputView(info: EditorInfo?, restarting: Boolean) {
        super.onStartInputView(info, restarting)
        if (::root.isInitialized) {
            root.setBackgroundColor(pal().kb)
            buildTabs(); openTab(current)
            updateReading()
        }
    }

    override fun onUpdateSelection(
        oldSelStart: Int, oldSelEnd: Int, newSelStart: Int, newSelEnd: Int,
        candidatesStart: Int, candidatesEnd: Int
    ) {
        super.onUpdateSelection(oldSelStart, oldSelEnd, newSelStart, newSelEnd, candidatesStart, candidatesEnd)
        if (::readView.isInitialized) updateReading()
    }

    override fun onDestroy() {
        tts?.stop(); tts?.shutdown(); tts = null
        super.onDestroy()
    }

    // ---------------------------------------------------------------- text actions

    private fun commit(text: String) {
        currentInputConnection?.commitText(text, 1)
        updateReading()
    }

    private fun backspace() {
        val ic = currentInputConnection ?: return
        val sel = ic.getSelectedText(0)
        if (sel != null && sel.isNotEmpty()) { ic.commitText("", 1) }
        else ic.deleteSurroundingTextInCodePoints(1, 0)
        updateReading()
    }

    private fun enter() {
        val ic = currentInputConnection ?: return
        val action = currentInputEditorInfo?.imeOptions?.and(EditorInfo.IME_MASK_ACTION) ?: EditorInfo.IME_ACTION_NONE
        val multiline = currentInputEditorInfo?.inputType?.and(android.text.InputType.TYPE_TEXT_FLAG_MULTI_LINE) != 0
        if (!multiline && action != EditorInfo.IME_ACTION_NONE && action != EditorInfo.IME_ACTION_UNSPECIFIED) {
            ic.performEditorAction(action)
        } else {
            ic.commitText("\n", 1)
        }
        updateReading()
    }

    private fun updateReading() {
        val before = currentInputConnection?.getTextBeforeCursor(80, 0)?.toString() ?: ""
        val r = Data.reading(before)
        readView.text = if (r.isEmpty()) "Reading" else r.takeLast(40)
        readView.alpha = if (r.isEmpty()) 0.5f else 1f
    }

    private fun speakReading() {
        val before = currentInputConnection?.getTextBeforeCursor(200, 0)?.toString() ?: ""
        val r = Data.reading(before)
        if (r.isEmpty()) { hintView.text = "Nothing to read yet"; return }
        speak(r.replace('-', ' '))
    }

    private fun speak(text: String) {
        val rate = when (prefs.getString("rate", "normal")) { "slow" -> 0.7f; "fast" -> 1.3f; else -> 0.95f }
        if (tts == null) {
            tts = TextToSpeech(applicationContext) { status ->
                if (status == TextToSpeech.SUCCESS) {
                    ttsReady = true
                    tts?.language = Locale.US
                    tts?.setSpeechRate(rate)
                    tts?.speak(text, TextToSpeech.QUEUE_FLUSH, null, "kk")
                }
            }
        } else if (ttsReady) {
            tts?.setSpeechRate(rate)
            tts?.speak(text, TextToSpeech.QUEUE_FLUSH, null, "kk")
        }
    }

    // ---------------------------------------------------------------- key builders

    private fun keyBg(color: Int, pressed: Boolean = false): GradientDrawable {
        val p = pal()
        val look = prefs.getString("look", "round")
        return GradientDrawable().apply {
            cornerRadius = dp(if (look == "flat") 3 else 9).toFloat()
            if (look == "outline" && !pressed) {
                setColor(Color.TRANSPARENT); setStroke(dp(1.5f), p.line)
            } else {
                setColor(if (pressed) p.accent else color)
            }
        }
    }

    /** Generic key. kind: 0 normal, 1 special, 2 accent. */
    private fun makeKey(
        label: String, hint: String? = null, kind: Int = 0, textSp: Float = 20f,
        repeat: Boolean = false, onTap: () -> Unit
    ): View {
        val p = pal()
        val base = when (kind) { 1 -> p.spec; 2 -> p.accent; else -> p.key }
        val inkColor = if (kind == 2) p.on else p.ink
        val fl = FrameLayout(this)
        fl.background = keyBg(base)
        val main = TextView(this).apply {
            text = label; setTextColor(inkColor); textSize = textSp
            gravity = Gravity.CENTER; setSingleLine(true)
        }
        fl.addView(main, FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT))
        if (hint != null && prefs.getString("hints", "on") == "on") {
            val h = TextView(this).apply { text = hint; setTextColor(p.mute); textSize = 9f }
            fl.addView(h, FrameLayout.LayoutParams(ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT).apply {
                gravity = Gravity.TOP or Gravity.START; leftMargin = dp(4); topMargin = dp(1)
            })
        }
        var repeater: Runnable? = null
        fl.setOnTouchListener { v, ev ->
            when (ev.actionMasked) {
                MotionEvent.ACTION_DOWN -> {
                    v.background = keyBg(base, true)
                    main.setTextColor(p.on)
                    v.performHapticFeedback(HapticFeedbackConstants.KEYBOARD_TAP)
                    onTap()
                    if (repeat) {
                        repeater = object : Runnable { override fun run() { onTap(); handler.postDelayed(this, 60) } }
                        handler.postDelayed(repeater!!, 380)
                    }
                }
                MotionEvent.ACTION_UP, MotionEvent.ACTION_CANCEL -> {
                    repeater?.let { handler.removeCallbacks(it) }
                    v.background = keyBg(base)
                    main.setTextColor(inkColor)
                }
            }
            true
        }
        return fl
    }

    private fun glyphKey(g: Glyph): View =
        makeKey(g.glyph, g.letter, 0, 22f) {
            commit(g.glyph)
            hintView.text = "${g.letter} → ${g.glyph} ${g.reading}"
            if (prefs.getString("keyspeak", "off") == "on") speak(g.reading)
        }

    private fun row(vararg keys: Pair<View, Float>, pad: Int = 0): LinearLayout {
        val r = LinearLayout(this).apply { orientation = LinearLayout.HORIZONTAL; setPadding(dp(pad), 0, dp(pad), 0) }
        keys.forEach { (v, w) ->
            r.addView(v, LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.MATCH_PARENT, w).apply {
                setMargins(dp(2), dp(2), dp(2), dp(2))
            })
        }
        return r
    }

    private fun rowsContainer(vararg rows: View): LinearLayout {
        val c = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL }
        rows.forEach { c.addView(it, LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, 0, 1f)) }
        return c
    }

    private fun numOut(digit: String): String {
        if (prefs.getString("num", "kaomojic") == "plain") return digit
        return Data.NUMBERS.first { it.first == digit }.second
    }

    // ---------------------------------------------------------------- tabs

    private val tabNames = listOf("ABC", "123", "Marks", "Faces", "Parts", "Phrases", "Set")

    private fun buildTabs() {
        val p = pal()
        tabRow.removeAllViews()
        tabNames.forEach { name ->
            val selected = name == current
            val t = TextView(this).apply {
                text = name; textSize = 14f; gravity = Gravity.CENTER
                setPadding(dp(14), 0, dp(14), 0)
                setTextColor(if (selected) p.on else p.mute)
                background = GradientDrawable().apply {
                    cornerRadius = dp(20).toFloat()
                    setColor(if (selected) p.accent else Color.TRANSPARENT)
                }
                setOnClickListener { openTab(name) }
            }
            tabRow.addView(t, LinearLayout.LayoutParams(ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.MATCH_PARENT).apply {
                setMargins(dp(2), dp(4), dp(2), dp(4))
            })
        }
    }

    private fun openTab(name: String) {
        current = name
        buildTabs()
        panel.removeAllViews()
        val v: View = when (name) {
            "ABC" -> abcPanel()
            "123" -> numbersPanel()
            "Marks" -> marksPanel()
            "Faces" -> gridPanel(Data.FACES, 3, 16f)
            "Parts" -> partsPanel()
            "Phrases" -> phrasesPanel()
            else -> setPanel()
        }
        panel.addView(v, FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT))
    }

    private fun bottomRow(): View = row(
        makeKey("ABC", null, 1, 14f) { openTab("ABC") } to 1.5f,
        makeKey("space", null, 0, 14f, true) { commit(" ") } to 5f,
        makeKey("⌫", null, 1, 18f, true) { backspace() } to 1.5f,
        makeKey("↵", null, 2, 18f) { enter() } to 1.5f
    )

    private fun abcPanel(): View {
        fun gk(ch: Char) = glyphKey(Data.BY_LETTER[ch.uppercase()]!!) to 1f
        val r1 = row(*"qwertyuiop".map { gk(it) }.toTypedArray())
        val r2 = row(*"asdfghjkl".map { gk(it) }.toTypedArray(), pad = 14)
        val r3 = row(
            makeKey("123", null, 1, 13f) { openTab("123") } to 1.5f,
            *"zxcvbnm".map { gk(it) }.toTypedArray(),
            makeKey("⌫", null, 1, 18f, true) { backspace() } to 1.5f
        )
        val r4 = row(
            makeKey("Marks", null, 1, 13f) { openTab("Marks") } to 1.5f,
            makeKey("space", null, 0, 14f, true) { commit(" ") } to 5f,
            makeKey("・", null, 1, 18f) { commit("・") } to 1f,
            makeKey("◦", null, 1, 18f) { commit("◦") } to 1f,
            makeKey("↵", null, 2, 18f) { enter() } to 1.5f
        )
        return rowsContainer(r1, r2, r3, r4)
    }

    private fun numbersPanel(): View {
        val top = row(*Data.NUMBERS.take(5).map { n -> numKey(n) }.toTypedArray())
        val mid = row(*Data.NUMBERS.drop(5).map { n -> numKey(n) }.toTypedArray())
        return rowsContainer(top, mid, bottomRow())
    }

    private fun numKey(n: Triple<String, String, String>): Pair<View, Float> =
        makeKey(n.second, n.first, 0, 24f) {
            commit(numOut(n.first)); hintView.text = "${n.first} → ${n.second} ${n.third}"
        } to 1f

    private fun marksPanel(): View {
        val items = Data.MARKS
        val rows = items.chunked(6).map { chunk ->
            row(*chunk.map { m ->
                makeKey(m.first, null, 0, 20f) { commit(m.first); hintView.text = m.second } to 1f
            }.toTypedArray())
        }
        return rowsContainer(*rows.toTypedArray(), bottomRow())
    }

    /** Scrollable grid of text keys that commit their label. */
    private fun gridPanel(items: List<String>, cols: Int, size: Float, extra: View? = null): View {
        val sv = ScrollView(this)
        val col = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL }
        if (extra != null) col.addView(extra)
        val g = GridLayout(this).apply { columnCount = cols }
        items.forEach { s ->
            val k = makeKey(s, null, 0, size) { commit(s) }
            g.addView(k, GridLayout.LayoutParams().apply {
                width = 0; height = dp(46)
                columnSpec = GridLayout.spec(GridLayout.UNDEFINED, 1f)
                setMargins(dp(2), dp(2), dp(2), dp(2))
            })
        }
        col.addView(g)
        col.addView(row(
            makeKey("ABC", null, 1, 14f) { openTab("ABC") } to 1.5f,
            makeKey("space", null, 0, 14f, true) { commit(" ") } to 5f,
            makeKey("⌫", null, 1, 18f, true) { backspace() } to 1.5f
        ), LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, dp(48)))
        sv.addView(col)
        return sv
    }

    private fun partsPanel(): View {
        val names = Data.PART_SETS.keys.toList()
        val holder = FrameLayout(this)
        fun show(n: String) {
            holder.removeAllViews()
            holder.addView(gridPanel(Data.PART_SETS[n]!!, 6, 20f, partChips(names, n, ::show)))
        }
        show(names[0])
        return holder
    }

    private fun partChips(names: List<String>, selected: String, onPick: (String) -> Unit): View {
        val p = pal()
        val r = LinearLayout(this).apply { orientation = LinearLayout.HORIZONTAL; setPadding(0, dp(2), 0, dp(4)) }
        names.forEach { n ->
            val on = n == selected
            val t = TextView(this).apply {
                text = n; textSize = 13f; gravity = Gravity.CENTER
                setPadding(dp(14), dp(6), dp(14), dp(6))
                setTextColor(if (on) p.on else p.mute)
                background = GradientDrawable().apply {
                    cornerRadius = dp(18).toFloat()
                    if (on) setColor(p.accent) else { setColor(Color.TRANSPARENT); setStroke(dp(1), p.line) }
                }
                setOnClickListener { onPick(n) }
            }
            r.addView(t, LinearLayout.LayoutParams(ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT).apply { rightMargin = dp(6) })
        }
        return r
    }

    private fun phrasesPanel(): View {
        val p = pal()
        val sv = ScrollView(this)
        val col = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL; setPadding(dp(2), dp(2), dp(2), dp(2)) }
        Data.PHRASES.forEach { (text, meaning) ->
            val item = LinearLayout(this).apply {
                orientation = LinearLayout.VERTICAL
                setPadding(dp(12), dp(8), dp(12), dp(8))
                background = keyBg(p.key)
                setOnClickListener { commit(text); hintView.text = meaning }
            }
            item.addView(TextView(this).apply { this.text = text; setTextColor(p.ink); textSize = 22f })
            item.addView(TextView(this).apply { this.text = meaning; setTextColor(p.mute); textSize = 12f })
            col.addView(item, LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT).apply { bottomMargin = dp(6) })
        }
        sv.addView(col)
        return sv
    }

    private fun setPanel(): View {
        val p = pal()
        val col = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL; setPadding(dp(6), dp(4), dp(6), dp(4)) }
        fun option(label: String, key: String, opts: List<Pair<String, String>>, def: String) {
            val r = LinearLayout(this).apply { orientation = LinearLayout.HORIZONTAL; gravity = Gravity.CENTER_VERTICAL }
            r.addView(TextView(this).apply { text = label; setTextColor(p.ink); textSize = 14f },
                LinearLayout.LayoutParams(0, dp(42), 1f))
            val cur = prefs.getString(key, def)
            opts.forEach { (v, name) ->
                val on = v == cur
                val t = TextView(this).apply {
                    text = name; textSize = 12f; gravity = Gravity.CENTER
                    setPadding(dp(10), dp(5), dp(10), dp(5))
                    setTextColor(if (on) p.on else p.mute)
                    background = GradientDrawable().apply {
                        cornerRadius = dp(16).toFloat()
                        if (on) setColor(p.accent) else { setColor(Color.TRANSPARENT); setStroke(dp(1), p.line) }
                    }
                    setOnClickListener {
                        prefs.edit().putString(key, v).apply()
                        root.setBackgroundColor(pal().kb)
                        openTab("Set")
                    }
                }
                r.addView(t, LinearLayout.LayoutParams(ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT).apply { leftMargin = dp(4) })
            }
            col.addView(r)
        }
        option("Theme", "theme", listOf("auto" to "Auto", "light" to "Light", "dark" to "Dark"), "auto")
        option("Key look", "look", listOf("round" to "Round", "flat" to "Flat", "outline" to "Outline"), "round")
        option("Corner letters", "hints", listOf("on" to "On", "off" to "Off"), "on")
        option("Numbers", "num", listOf("kaomojic" to "Kaomojic", "plain" to "0-9"), "kaomojic")
        option("Speak each key", "keyspeak", listOf("off" to "Off", "on" to "On"), "off")
        option("Speech speed", "rate", listOf("slow" to "Slow", "normal" to "Normal", "fast" to "Fast"), "normal")
        val sv = ScrollView(this)
        sv.addView(col)
        return sv
    }
}
