// style handlers
export const handleCursorPointer = (e) => {
	e.stopPropagation()
	document.body.style.cursor = 'pointer'
}

export const handleCursorRevert = (e) => {
	e.stopPropagation()
	document.body.style.cursor = 'default'
}
// note stuff
export const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
export const notesF = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']
export const notesLength = notes.length

export const noteDurations = [1, 2, 4, 8, 16, 32, 64]

export const timeSignatureBeatRange = [1, 96] // oa na ang 96 actually pero pagbigyan natin ang mga jugagu

export const isNatural = (noteName) => {
	const regex = new RegExp(/#|b/)
	return !regex.test(noteName)
}

export const getNoteAlt = (noteName) => {
	if (isNatural(noteName)) return noteName

	let index
	let arrToUse

	if (notesF.includes(noteName)) {
		arrToUse = notes
		index = notesF.indexOf(noteName)
	} else {
		arrToUse = notesF
		index = notes.indexOf(noteName)
	}

	return arrToUse[index]
}

export const noteInRange = (
	midiCode,
	{ octaves = 1, octaveCodeOffset = 0, startNote = 'C', endNote = 'B' }
) => {
	const startMidi = notes.indexOf(startNote) + notesLength * octaveCodeOffset
	const endMidi =
		notes.indexOf(endNote) + notesLength * (octaves - 1 + octaveCodeOffset)

	// console.log('oc',octave,'in',octaves)
	// console.log(midiCode,octaves,startNote,startMidi,notes.indexOf(startNote),endNote,endMidi)

	return midiCode >= startMidi && midiCode <= endMidi
}

//midi tings
export const midiRange = [0, 127]

export const midiControlCode = {
	soften: 67,
	expression: 11,
	sostenuto: 66,
	sustain: 64,
	reverb: 91, //ambience
	volume: 7,
}

//time based stuff
export const getTimeLength = (beats, bpm) => (60 / bpm) * beats * 1000

export const getRate = (bpm) => 60 / bpm

export const bpmRange = [1, 666]

// how much ear damage we can support
export const volumeRange = [-30, 6]

// other shits
export const getPolarColor = (hex) => {
	// Remove any leading "#" from the hex color
	hex = hex.replace(/^#/, '')

	// Convert the hex color to RGB values
	const r = parseInt(hex.slice(0, 2), 16) / 255
	const g = parseInt(hex.slice(2, 4), 16) / 255
	const b = parseInt(hex.slice(4, 6), 16) / 255

	// Calculate the relative luminance
	const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b

	// Decide whether to return white or black based on the luminance
	if (luminance < 0.5) {
		return 'var(--c-light)'
	} else {
		return 'var(--c-dark)'
	}
}

export const arrIdentical = (arr1, arr2) => {
	if (arr1.length !== arr2.length) {
		return false
	}

	const map = new Map()

	for (const item of arr1) {
		map.set(item, (map.get(item) || 0) + 1)
	}

	for (const item of arr2) {
		if (!map.has(item)) {
			return false
		}
		if (map.get(item) === 1) {
			map.delete(item)
		} else {
			map.set(item, map.get(item) - 1)
		}
	}

	return true
}

export const rainbowColors = [
	'red', // Red
	// 'orangered', // Orange-Red
	'orange', // Orange
	// 'gold', // Gold
	'yellow', // Yellow
	// 'lime', // Lime
	'green', // Green
	// 'darkgreen', // Dark Green
	'blue', // Blue
	// 'royalblue', // Royal Blue
	'indigo', // Indigo
	// 'purple', // Purple
	'violet', // Violet
	// 'pink', // Pink
	'hotpink', // Hot Pink
	// 'fuchsia', // Fuchsia
]

// because tone js and mobile os together are being such little bitches
export const deviceChecksOut = () => {
	return window.matchMedia(
		'(min-width: 768px), (orientation: landscape), (pointer: fine)'
	).matches
}