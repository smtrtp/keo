package com.kaomoji.keyboard

import android.app.Activity
import android.content.Context
import android.graphics.Typeface
import android.os.Bundle
import android.provider.Settings
import android.text.InputType
import android.view.ViewGroup
import android.view.inputmethod.InputMethodManager
import android.widget.Button
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.TextView

/** Launcher screen: walks the person through turning the keyboard on and lets them try it. */
class SettingsActivity : Activity() {

    private fun dp(v: Int) = (v * resources.displayMetrics.density + 0.5f).toInt()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        title = "Kaomoji Keyboard"
        val col = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(20), dp(20), dp(20), dp(20))
        }
        fun text(s: String, size: Float, bold: Boolean = false) = TextView(this).apply {
            text = s; textSize = size
            if (bold) typeface = Typeface.DEFAULT_BOLD
            setPadding(0, dp(6), 0, dp(6))
        }
        fun button(s: String, f: () -> Unit) = Button(this).apply {
            text = s; isAllCaps = false; setOnClickListener { f() }
        }

        col.addView(text("(◕ω◕)  Kaomoji Keyboard", 22f, true))
        col.addView(text("A keyboard where every letter is a kaomoji part. Each glyph has a reading, shown above the keys.", 15f))

        col.addView(text("Step 1", 14f, true))
        col.addView(button("Turn on Kaomoji Keyboard") {
            startActivity(android.content.Intent(Settings.ACTION_INPUT_METHOD_SETTINGS))
        })
        col.addView(text("Step 2", 14f, true))
        col.addView(button("Choose Kaomoji Keyboard") {
            (getSystemService(Context.INPUT_METHOD_SERVICE) as InputMethodManager).showInputMethodPicker()
        })
        col.addView(text("Step 3: try it here", 14f, true))
        col.addView(EditText(this).apply {
            hint = "Tap and type"
            textSize = 24f
            inputType = InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_FLAG_MULTI_LINE
            minLines = 3
        }, LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT))
        col.addView(text("Tip: the Set tab on the keyboard changes theme, key look, number style and speech. Tap the Reading strip to hear the text read aloud.", 13f))

        setContentView(ScrollView(this).apply { addView(col) })
    }
}
