// depends on "roma2.hiragana" func (http://la.ma.la/js/roma.js)
function NoIME(that) {
	var DEBUG = false
	var specialKeys = [8, 9, 13, 16, 17, 18, 19, 20, 27, 33, 34, 35, 36, 37, 38, 39, 40, 45, 46, 91]
	var selectionStart = 1
	var wait = 500
	var timer = null
	that.onkeyup = function(e) {
		var isSpecialKey = false
		for(var i = 0; i < specialKeys.length; i++) {
			if(e.keyCode == specialKeys[i]) isSpecialKey = true
		}
		if(isSpecialKey || e.altKey || e.ctrlKey) {
			selectionStart = that.selectionStart
			log("selectionStart:"+selectionStart)
		} else {
	       		if(timer) clearTimeout(timer)
	       		timer = setTimeout(startConvert, wait)
		}
	}
	that.onclick = function(e) {
		selectionStart = that.selectionStart
	}
	function startConvert() {
		var start = selectionStart
		var end = that.selectionStart
		var roma = that.value.slice(start, end).replace(/ /g, "")
		if(roma == "") return
		var kana = roma2.hiragana(roma)
		log(["start:"+start, "end:"+end, "roma:"+roma, "kana:"+kana].join(","))
		substituteText(start, end, kana)
		end -= roma.length - kana.length
		setCursorPos(end)
		getJSON(kana, ondata(start, end, kana))
		selectionStart = end - 1
	}
	function ondata(start, end, kana) {
		return function(data) {
			var result = ''
			for(var i = 0; i < data.length; i++) {
				result += data[i][1][0]
			}
			log(["start:"+start, "end:"+end, "result:"+result].join(","))
			substituteText(start, end, result)
			selectionStart = selectionStart - (kana.length - result.length) + 1
			setCursorPos(selectionStart)
		}
	}
	function getJSON(text, callback) {
		var callbackName = "NoIME_" + (""+Math.random()).replace(/\D/g, "")
		window[callbackName] = callback
		var url = [
			"http://www.google.com/transliterate?langpair=ja-Hira|ja",
			"&jsonp=", callbackName,
			"&text=", encodeURI(text)
		].join("")
		var script = document.createElement("script")
		script.src = url
		script.charset = "UTF-8"
		document.head.appendChild(script)
	}
	function substituteText(start, end, text) {
		var before = that.value.slice(0, start)
		var after = that.value.slice(end)
		that.value = [before, text, after].join("")
	}
	function setCursorPos(pos) {
		log("setCursorPos: " + pos)
		that.setSelectionRange(pos, pos)
	}
	function log(text) {
		if(DEBUG == true) console.log("[NoIME] " + text)
	}
}
