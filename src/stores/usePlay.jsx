import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

import { voicesProps } from './../imports/audio'
import { demoProps } from './../imports/demo'
import keebControl from '../imports/keebControl'

import {
	notesLength,
	noteDurations,
	volumeRange,
	noteInRange,
	timeSignatureBeatRange,
	bpmRange,
} from '../imports/helpers'


export default create(
	subscribeWithSelector((set) => {
		// https://computermusicresource.com/midikeys.html
		return {
			// only let user make noises when it should or baka ma tick should
			ready: false,

			// session settings. the music kind tho not the cookies and storage settings. technically it is but shut up.

			// keys props
			octaves: 9,
			startNote: 'A',
			endNote: 'F',

			// offset of midi code because negative is a thing on some sad beats thing sometimes but not always
			octaveCodeOffset: 1,

			// how much ear damage u want
			volume: 0,

			// aka tempo aka a healthy blood pressure i think idk im not a medical expert like the rest of my family because i went for an art degree
			bpm: 120,

			// how sinful u want ur blood pressure to be??

			// idk recall ur music classes from elementary stupid creature
			timeSignature: [4, 4],

			// coz there are some songs u cant sing in C major or whatever the fuck the key is at rn
			transpose: 0,

			// instructions n shit
			controlsMapOn: '',

			// so sad beats ppl can boop boop boop
			midiControl: 0,

			// track midi inputs
			midiInputs: null,

			// if can use keeb controls or nah so it doesnt conflict with input fields and what note
			canKeeb: true,

			// which octave is normal person playing. middle c's octave by default
			keebOctave: 5,

			// ui/experience states

			// which bitch are we looking at
			focusOn: '',

			// lerp fix because webkit is being such a little bitch
			hasPianoScreen: true,

			//for warnings
			subtitle: '',

			// which index from the available sampler voices i set up for u pucharagis
			voice: 0,

			//track if yuh fetched the sampler's files yet or nah
			samplerReady: false,

			// i dont want the demo playing all the time good lord
			// which index u want to play for u then u can pretend ur as good as me when u play the piano. jk im just ok at it
			demo: 0,

			// is ya boi playing something or what
			isDemoing: false,

			// so it doesnt get in the way of the live player
			playingDemo: [],

			// in case user reswets, yuh boi remembers the last demo u wanted to play. like how my arturia keylab and code 49 loves me ahuhuhu
			demoLast: -1,

			// 0 if the metronome is playing, if not it's a random number, tapos pag u kwan u change it changes to a random number para alam ni kuya three js tsaka ni ate tone js kung magtitiktok na si shuta
			metronomeSeed: 0,

			// how much reflections on a scale of 0 to 1. yes the mulan song u stupid creature. jk it's just the reverb
			ambience: 0,
			// TODO if tone js can allow to swap from this hall reverb fuckery to a chamber or room one because it sounds like how this scene looks. probably not tho because performance is a thing. woULD REALLY LIKE A CHAMBER REFLECTION THO >:[

			// track if we turning the knobs or what so we dont accidentally boop other stuff
			isAmbiencing: false, // todo kwan make this universal and u pass a bitch so its not just ambience

			// softens ya boi. also shifts the keys a lil bit coz real pianos actually do that waw
			soften: 0,

			// sustain keys only when pedaldown happened
			sostenuto: 0,

			//why do i punish myself
			playingSos: [],

			// sustain everything
			sustain: 0,

			// which bois be playin
			playing: [],

			start: () => {
				set(() => {
					return { ready: true }
				})
			},

			//duh
			setVolume: (newVolume = 0) => {
				set((state) => {
					if (!state.ready) return {}

					const toReturn = {}

					if (
						newVolume !== state.volume &&
						newVolume >= volumeRange[0] &&
						newVolume <= volumeRange[1]
					) {
						toReturn.volume = newVolume
					}

					return toReturn
				})
			},

			// duh
			setBPM: (newBPM = 120) => {
				set((state) => {
					if (!state.ready) return {}

					const toReturn = {}

					newBPM = parseInt(newBPM)

					if (
						newBPM !== state.bpm &&
						newBPM >= bpmRange[0] &&
						newBPM <= bpmRange[1]
					) {
						toReturn.bpm = newBPM

						if (state.metronomeSeed > 0) {
							toReturn.metronomeSeed = Math.random() + 0.1
						}
					}

					return toReturn
				})
			},

			//duh
			setTimeSignature: ([newNote, newBeat]) => {
				set((state) => {
					if (!state.ready) return {}

					const toReturn = {}

					if (!(newNote || newBeat)) {
						toReturn.timeSignature = [4, 4]
					} else {
						toReturn.timeSignature = [...state.timeSignature]

						newNote = parseInt(newNote)
						newBeat = parseInt(newBeat)

						if (noteDurations.includes(newNote)) {
							toReturn.timeSignature[0] = newNote
						}

						if (
							newBeat >= timeSignatureBeatRange[0] &&
							newBeat <= timeSignatureBeatRange[1]
						) {
							toReturn.timeSignature[1] = newBeat
						}
					}

					return toReturn
				})
			},

			// duh
			// todo: track if midi keyboards did a thing too
			setTranspose(newTranspose = 0) {
				set((state) => {
					if (!state.ready) return {}

					return {
						transpose:
							newTranspose <= 12 && newTranspose >= -12
								? newTranspose
								: 0, // reset to root
					}
				})
			},

			setControlMap: (newControl) => {
				set((state) => {
					if (!newControl) {
						return { controlsMapOn: '' }
					} else {
						if (newControl !== state.controlsMapOn)
							return { controlsMapOn: newControl }
					}
				})
			},

			updateMidiControl: (newMidiControl) => {
				set(() => {
					if (!newMidiControl) {
						return { midiControl: 0 }
					} else {
						return { midiControl: newMidiControl }
					}
				})
			},

			setMidiInputs: (newInputs) => {
				set(() => {
					if (!newInputs) {
						return { midiInputs: null }
					} else {
						return { midiInputs: newInputs }
					}
				})
			},

			enableKeebs: () => {
				set((state) => {
					if (!state.ready) return {}
					return { canKeeb: true }
				})
			},

			disableKeebs: () => {
				set((state) => {
					if (!state.ready) return {}
					return { canKeeb: false }
				})
			},

			//yea
			setKeebOctave: (_newKeebOctave) => {
				set((state) => {
					if (!state.ready) return {}

					let newKeebOctave

					if (_newKeebOctave < 1 || !_newKeebOctave) {
						newKeebOctave = Math.floor(
							keebControl.notes.length / notesLength
						)
					} else if (
						_newKeebOctave >=
						state.octaves -
							Math.floor(keebControl.notes.length / notesLength)
					) {
						newKeebOctave =
							state.octaves -
							Math.floor(keebControl.notes.length / notesLength)
					} else {
						newKeebOctave = _newKeebOctave
					}

					if (newKeebOctave) {
						return { keebOctave: newKeebOctave, playing: [] }
					} else {
						return {}
					}
				})
			},

			// duh
			setFocus(newFocus) {
				set((state) => {
					if (!state.ready) return {}

					if (newFocus !== state.focusOn) {
						return { focusOn: newFocus }
					} else {
						return {}
					}
				})
			},

			// duh
			showPianoScreen() {
				set((state) => {
					if (!state.ready) return {}

					return { hasPianoScreen: true }
				})
			},

			// duh
			hidePianoScreen() {
				set((state) => {
					if (!state.ready) return {}

					return { hasPianoScreen: false }
				})
			},

			// duh
			setSubtitle(newSubtitle) {
				set((state) => {
					if (!state.ready) return {}

					return { subtitle: newSubtitle }
				})
			},

			// duh
			updateVoice: (newVoice) => {
				set((state) => {
					if (!state.ready) return {}

					if (newVoice < voicesProps.length && state.voice !== newVoice) {
						return { voice: newVoice }
					} else {
						return {}
					}
				})
			},

			// duh
			liveDemo: () => {
				set((state) => {
					if (!state.ready) return {}

					const toReturn = {
						isDemoing: true,
						playingDemo: [],
						playing: [],
						soften: 0,
						sostenuto: 0,
						sustain: 0,
						bpm: 120,
						timeSignature: [4, 4],
					}

					// only allow swap if it was already running
					if (state.isDemoing) {
						if (state.demo >= demoProps.length - 1) {
							toReturn.isDemoing = false
							toReturn.demo = 0
						} else {
							toReturn.demo = state.demo + 1
						}
					}

					if (state.metronomeSeed > 0) {
						toReturn.metronomeSeed = Math.random() + 0.1
					}

					return toReturn
				})
			},

			// duh
			dieDemo: (newDemo) => {
				set((state) => {
					if (!state.ready) return {}

					const toReturn = {
						isDemoing: false,
						playingDemo: [],
						playing: [],
						soften: 0,
						sostenuto: 0,
						sustain: 0,
						bpm: 120,
						timeSignature: [4, 4],
					}

					if (newDemo < demoProps.length) {
						toReturn.demo = newDemo
					}

					if (state.metronomeSeed > 0) {
						toReturn.metronomeSeed = Math.random() + 0.1
					}

					return toReturn
				})
			},

			// duh
			setSamplerReady(value) {
				set(() => {
					// console.log('setting sampleReady',value)
					return { samplerReady: value }
				})
			},

			// duh
			liveMetronome: () => {
				set((state) => {
					if (!state.ready) return {}

					if (!state.metronomeSeed) {
						return { metronomeSeed: Math.random() + 0.1 }
					} else {
						return {}
					}
				})
			},

			// duh
			dieMetronome: () => {
				set((state) => {
					if (!state.ready) return {}

					if (state.metronomeSeed > 0) {
						return { metronomeSeed: 0 }
					} else {
						return {}
					}
				})
			},

			// duh
			updateAmbience: (_newAmbience) => {
				set((state) => {
					if (!state.ready) return {}

					let newAmbience

					if (_newAmbience < 0 || !_newAmbience) {
						newAmbience = 0
					} else if (_newAmbience > 1) {
						newAmbience = 1
					} else {
						newAmbience = _newAmbience
					}

					if (newAmbience !== state.ambience) {
						return { ambience: newAmbience }
					} else {
						return {}
					}
				})
			},

			// duh
			toggleAmbienceInProgress(isAmbiencing) {
				set((state) => {
					if (!state.ready) return {}

					return { isAmbiencing: isAmbiencing }
				})
			},

			// duh
			updateSoften: (_newSoften) => {
				set((state) => {
					if (!state.ready) return {}

					let newSoften

					if (_newSoften < 0 || !_newSoften) {
						newSoften = 0
					} else if (_newSoften > 1) {
						newSoften = 1
					} else {
						newSoften = _newSoften
					}

					// console.log('newSoften new','dati',state.soften,newSoften,_newSoften,'real val')
					if (newSoften !== state.soften) {
						return { soften: newSoften }
					} else {
						return {}
					}
				})
			},

			// duh
			updateSostenuto: (_newSostenuto) => {
				set((state) => {
					if (!state.ready) return {}

					let newSostenuto

					if (_newSostenuto < 0 || !_newSostenuto) {
						newSostenuto = 0
					} else if (_newSostenuto > 1) {
						newSostenuto = 1
					} else {
						newSostenuto = _newSostenuto
					}
					// console.log('newSostenuto new','dati',state.sostenuto,newSostenuto,_newSostenuto,'real val')
					if (newSostenuto !== state.sostenuto) {
						const toReturn = { sostenuto: newSostenuto }

						if (!newSostenuto) {
							toReturn.playingSos = []
						}

						return toReturn
					} else {
						return {}
					}
				})
			},

			// duh
			updateSustain: (_newSustain) => {
				set((state) => {
					if (!state.ready) return {}

					let newSustain

					if (_newSustain < 0 || !_newSustain) {
						newSustain = 0
					} else if (_newSustain > 1) {
						newSustain = 1
					} else {
						newSustain = _newSustain
					}
					// console.log('newSustain new','dati',state.sostenuto,newSustain,_newSustain,'real val')
					if (newSustain !== state.sustain) {
						return { sustain: newSustain }
					} else {
						return {}
					}
				})
			},

			// adSR MOTHERFUCKAAAA
			attack: (midiCode, velocity = 1, toDemo = false) => {
				set((state) => {
					if (!state.ready || (toDemo && !state.isDemoing)) return {}

					const toReturn = {}
					const affect = toDemo ? 'playingDemo' : 'playing'

					if (
						!state[affect].filter(([m]) => m == midiCode).length &&
						noteInRange(midiCode, state)
					) {
						// console.log('playin',midiCode)
						// console.log('playing before attack', state.playing, state.releasing)

						toReturn[affect] = [[midiCode, velocity], ...state[affect]]

						if (state.sostenuto > 0 && !toDemo) {
							if (
								!state.playingSos.filter(([m]) => m == midiCode).length
							) {
								toReturn.playingSos = [
									[midiCode, velocity],
									...state.playingSos,
								]
							}
						}
					}
					return toReturn
				})
			},

			// the r part in adsr
			release: (midiCode, toDemo = false) => {
				set((state) => {
					if (!state.ready) return {}

					const affect = toDemo ? 'playingDemo' : 'playing'

					const toReturn = {}

					if (typeof midiCode !== 'number') {
						// console.log('releasing all')
						toReturn.playing = []
						toReturn.playingDemo = []

						if (state.sostenuto <= 0 && !toDemo) {
							toReturn.playingSos = []
						}
					} else {
						// console.log('release specific',midiCode)
						const i = state[affect].findIndex(([m]) => m == midiCode)
						if (i !== -1) {
							toReturn[affect] = [
								...state[affect].filter(([m]) => m !== midiCode),
							]
						}
					}

					return toReturn
				})
			},
		}
	})
)
