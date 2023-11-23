/*
Sounds: para may marining kang buruguduystunstugudunstuy by Parokya Ni Edgar
*/
// todo. release visual is watdapak ayusin mo yan`
import * as Tone from 'tone'
import { useEffect, useState, useMemo, useRef } from 'react'
import usePlay from '../stores/usePlay.jsx'
import {
	arrIdentical,
	getTimeLength,
	midiControlCode,
	volumeRange,
} from '../imports/helpers'

import { voicesProps, Metronome } from '../imports/audio'
import { demoProps, demoPPQ } from '../imports/demo.js'

// alin mas makulog three js, react o ining tone js... yes
export default function Sounds() {
	//states bebe
	const ready = usePlay((state) => state.ready)

	const volume = usePlay((state) => state.volume)

	const bpm = usePlay((state) => state.bpm)
	const setBPM = usePlay((state) => state.setBPM)
	const setTimeSignature = usePlay((state) => state.setTimeSignature)

	// const transpose = usePlay((state) => state.transpose)
	// todo apply as an insert instead..... oh god
	// nvm it sounds like shit. try to get schedule to dynamically apply this

	const voice = usePlay((state) => state.voice)
	const setSamplerReady = usePlay((state) => state.setSamplerReady)

	const demo = usePlay((state) => state.demo)
	const isDemoing = usePlay((state) => state.isDemoing)
	const liveDemo = usePlay((state) => state.liveDemo)
	const dieDemo = usePlay((state) => state.dieDemo)

	const metronomeSeed = usePlay((state) => state.metronomeSeed)

	const ambience = usePlay((state) => state.ambience)
	const updateAmbience = usePlay((state) => state.updateAmbience)

	const soften = usePlay((state) => state.soften)
	const updateSoften = usePlay((state) => state.updateSoften)

	// const sostenuto = usePlay((state) => state.sostenuto)
	const updateSostenuto = usePlay((state) => state.updateSostenuto)

	const sustain = usePlay((state) => state.sustain)
	const updateSustain = usePlay((state) => state.updateSustain)

	const attack = usePlay((state) => state.attack)
	const release = usePlay((state) => state.release)

	// max it to a whole notes why not // todo tone js
	const longReleaseTime = useMemo(() => {
		return getTimeLength(8, bpm)
	}, [bpm])

	//tiktok by kesha or the app where mimiyuuh thrives for some reason. why she and anne curtis get a singing career i will never know. love them tho
	const theMetronome = useRef()

	// the pingpingping and eternal screams of my child
	const liveSampler = useRef()
	const demoVoices = useRef()
	const demoParts = useRef()

	// and then inserts or plugins or effects but in the music terms because programmers are gonna think of different things from this because they are robots. oh god am i a robot? no im cyborg from teen titans. im like half robot half mental problems  ...myess

	// // for soft pedophile replicate una corda effect using lowpass plus eq-ing would be overkill
	// // how dare the latency of this bitch
	// const theFilter = useRef()

	// // for transpose
	// const thePitch = useRef()
	// nvm it sounds like shit

	// aka ambience aka reflection or what the amateurs call the echo  but it's really not dwight ignorant slut
	const theReverb = useRef()

	//todo add pan based on key being played because sometimes i wanna be realistic

	const [voiceAlreadyLoaded, setToneAlreadyLoaded] = useState([0])

	const createSamplerInstance = (voice, cb = (r) => {}) => {
		let toReturn

		if (!voiceAlreadyLoaded.includes(voice)) {
			setSamplerReady(false)
		}

		toReturn = new Tone.Sampler(
			{
				...voicesProps[voice].args.urls,
			},
			{
				onload: () => {
					// console.log('loaded a bitcha')
					if (!voiceAlreadyLoaded.includes(voice)) {
						setToneAlreadyLoaded([...voiceAlreadyLoaded, voice])
						setTimeout(() => {
							setSamplerReady(true)
							cb(toReturn)
						}, 500)
					} else {
						setSamplerReady(true)
						cb(toReturn)
					}
				},
			}
		)

		return toReturn
	}

	const [theContext, setTheContext] = useState(null)

	//init tone shenanigans
	useMemo(() => {
		// Tone.setContext( new Tone.Context({ latencyHint: 'playback' }) ) // so this was a lie

		Tone.Context.lookAhead = 0.05 //wtf

		// because we're working with logic tsaka once lang daw dapat idogshow si kuya which is convenient
		Tone.Transport.PPQ = demoPPQ

		// metronome loop
		theMetronome.current = new Tone.Loop(() => {
			// console.log('u playin bitch')
			const tick = new Tone.Player(Metronome).connect(Tone.Destination)
			tick.set({
				autostart: true,
				volume: -10 + volume, //u so loud ew
			})
		}, '4n')

		demoVoices.current = []
		demoParts.current = []

		// // transposeEE
		// thePitch.current = new Tone.PitchShift()

		// // replicate soften sound to the extent that the web and peasant kompyuters allow us
		// theFilter.current = new Tone.Filter()

		theReverb.current = new Tone.Freeverb()
		theReverb.current.dampening = 600
		// theReverb.current = new Tone.Reverb() // B R U H >:(
		// theReverb.current.normalize = true // ay sad
	}, [])

	// updoot live samplerrr
	useEffect(() => {
		// idk i like to be safe

		let wasDemoing = isDemoing ? 1 : 0

		if (liveSampler.current) {
			dieDemo()
			// console.log('stap na po',isDemoing,demo)
			liveSampler.current.releaseAll()
			liveSampler.current.disconnect()
		}

		// console.log('ma start achan',wasDemoing,ambience,isDemoing)

		liveSampler.current = createSamplerInstance(voice, () => {
			if (wasDemoing) {
				// console.log('dali na')
				liveDemo()
			}
		})
	}, [voice])

	// update tone shenanigan

	useEffect(() => {
		if (theReverb.current) {
			theReverb.current.set({
				roomSize: 0.9 * ambience,
				wet: 0.75 * ambience,
			})
			// theReverb.current.set({
			//     preDelay: getTimeLength(.125,bpm),
			//     decay: 0.001 + (getTimeLength(4,bpm) * ambience),
			//     wet: .75 * ambience,
			// })
		}
	}, [
		ambience,
		// bpm
	])

	// useEffect(() => {
	// 	if (theFilter.current) {
	// 		theFilter.current.set({
	// 			frequency: 20000 - Math.ceil(19125 * soften),
	// 			type: 'lowpass',
	// 			rolloff: -12,
	// 			q: 0.75,
	// 		})
	// 	}
	// }, [soften])

	// useEffect(() => {
	// 	if (thePitch.current) {
	// 		thePitch.current.pitch = transpose
	// 	}
	// }, [transpose])

	useEffect(() => {
		if (liveSampler.current) {
			//sustain
			liveSampler.current.set({
				release: longReleaseTime * sustain + 0.8,
			})
		}
	}, [sustain, voice])

	useEffect(() => {
		if (volume == volumeRange[0]) {
			Tone.Destination.mute = true
		} else {
			Tone.Destination.mute = false
			Tone.Destination.set({
				volume:
					// offset ear damage a bit so everyone's ears and hearts are happy. please dont take it off i already tried and i got jumpscared. 666/10 would not recommend huhuhuhu
					volume - 0.5
			})
		}
	}, [volume])

	useEffect(() => {
		if (liveSampler.current) {
			liveSampler.current.set({
				volume: 0 +
					-10 * soften + // 0.1
					-1.5 * ambience, // to do move for piano only
			})
		}
	}, [ambience, soften])

	useEffect(() => {
		if (theMetronome.current) {
			theMetronome.current.stop()
			if (!isDemoing) {
				Tone.Transport.stop()
			}

			if (metronomeSeed > 0) {
				theMetronome.interval = '4n'
				theMetronome.current.start(0)
				if (!isDemoing) {
					Tone.Transport.start()
				}
			} else {
			}
		}
	}, [metronomeSeed, bpm])

	let oldPlaying = [],
		oldPlayingSos = [],
		oldSostenuto = 0,
		oldSustain = 0

	const playLive = (curr) => {
		const releaseOffset = 0.25
		// reset tootoot if need be
		const canForceRelease =
			!(curr.sustain > 0) && oldSustain !== curr.sustain && !curr.playing.length

		// k pwede na patayin sila lahat so palayain natin
		if (canForceRelease) {
			liveSampler.current.releaseAll(Tone.context.currentTime)
		}
		oldSustain = curr.sustain

		//sostenuto
		if (oldSostenuto !== curr.sostenuto && curr.sostenuto == 0) {
			liveSampler.current.release(
				oldSostenuto.map(([midiCode]) =>
					Tone.Frequency(midiCode, 'midi').toNote()
				),
				Tone.context.currentTime + releaseOffset
			)
		}

		// play shit based on whatever the fuck is happening right now

		// pwede buksan
		let toAttack = []

		// pwede patayin
		let toRelease = []

		// mga lutang na may sariling mundo
		let toSos = []

		//aysooos
		if (curr.sostenuto > 0 && !arrIdentical(curr.playingSos, oldPlayingSos)) {
			// ignore whatever the fuck is already being sossy
			// toSos = curr.playingSos.filter(midiCode => !oldPlayingSos.filter(([m]) => m == midiCode).length.length)
			toSos = curr.playingSos.filter(
				([midiCode]) => !oldPlayingSos.filter(([m]) => m == midiCode).length
			)

			oldPlayingSos = [...curr.playingSos]
		}

		//update lang natin kung may bago sa buhay nila
		if (!arrIdentical(curr.playing, oldPlaying)) {
			// ignore sossy bois
			toAttack = curr.playing.filter(
				([midiCode]) =>
					!oldPlaying.filter(([m]) => m == midiCode).length &&
					!toSos.filter(([m]) => m == midiCode).length
			)

			//bye bitch
			toRelease = oldPlaying.filter(
				([midiCode]) =>
					!curr.playing.filter(([m]) => m == midiCode).length &&
					(!curr.sostenuto ||
						(curr.sostenuto > 0 &&
							!curr.playingSos.filter(([m]) => m == midiCode).length))
			)

			oldPlaying = [...curr.playing]
		}

		//sosbois
		if (toSos.length) {
			toSos.map(([midiCode, velocity]) => {
				liveSampler.current.triggerAttackRelease(
					Tone.Frequency(midiCode + curr.transpose, 'midi').toNote(),
					Tone.context.currentTime + longReleaseTime * curr.sostenuto + 0.1,
					Tone.context.currentTime,
					velocity
				)
			})
		}

		//releases
		if (toRelease.length) {
			toRelease.map(([midiCode]) => {
				liveSampler.current.triggerRelease(
					Tone.Frequency(midiCode + curr.transpose, 'midi').toNote(),
					Tone.context.currentTime + releaseOffset
				)
			})
		}

		//attacks
		if (toAttack.length) {
			//release the attackee bois
			// toAttack.map(([midiCode]) => {
			// 	liveSampler.current.triggerRelease(
			// 		Tone.Frequency(midiCode + curr.transpose, 'midi').toNote(),
			// 		en.AttackR
			// 	)
			// })

			toAttack.map(([midiCode, velocity]) => {
				liveSampler.current.triggerAttack(
					Tone.Frequency(midiCode + curr.transpose, 'midi').toNote(),
					Tone.context.currentTime, // what the shit
					velocity
				)
			})
		}
	}

	useEffect(() => {
		if (liveSampler.current && ready) {
			// console.log('stopping all shuta')
			liveSampler.current.releaseAll()

			for (let i = 0; i < demoParts.current.length; i++) {
				demoParts.current[i].stop()
			}
			demoParts.current = []

			//dispose the synth and make a new one

			for (let i = 0; i < demoVoices.current.length; i++) {
				demoVoices.current[i].releaseAll(Tone.now)
				trackVoice.current[i].disconnect()
			}
			demoParts.current = []

			Tone.Transport.cancel()
			Tone.Draw.cancel()
			Tone.Transport.stop()
			Tone.Transport.clear()

			if (isDemoing) {
				const demoMidi = { ...demoProps[demo].midi }
				const midiHeader = demoMidi.header
				const tracksCount = demoMidi.tracks.length

				const trackEnd = Math.max(demoMidi.tracks.map((t) => t.endOfTrackTicks))

				// const lastTick =

				const drawOffset = Tone.context.lookAhead
				// const drawOffset = 0

				// const bpmOffset = 120 // ahahahah shit.

				// https://github.com/Tonejs/Midi/issues/81
				//ewan ko thots and prayers

				//tisoy
				for (let i = 0; i < midiHeader.timeSignatures.length; i++) {
					Tone.Transport.scheduleOnce((t) => {
						setTimeSignature(midiHeader.timeSignatures[i].timeSignature)
					}, midiHeader.timeSignatures[i].ticks + 'i')
				}

				// tiktok
				for (let i = 0; i < midiHeader.tempos.length; i++) {
					Tone.Transport.scheduleOnce((t) => {
						setBPM(Math.ceil(midiHeader.tempos[i].bpm))
					}, midiHeader.tempos[i].ticks + 'i')
				}

				// catch end
				Tone.Transport.scheduleOnce((t) => {
					liveDemo(true)
				}, trackEnd + 'i')
				//control changes

				// tracks... dae pwedeng sarong loop ta makakagadan sya ning playback..
				for (let i = 0; i < tracksCount; i++) {
					// if it fucks up playback, probably let just one channel handle the pedaling

					let softenControl, softenCode

					// // soften -> soften
					if (
						demoMidi.tracks[i].controlChanges[
							midiControlCode.soften.toString()
						]
					) {
						softenControl =
							demoMidi.tracks[i].controlChanges[
								midiControlCode.soften.toString()
							]
						softenCode = midiControlCode.soften

						// // soften -> expression fallback
					} else {
						softenControl =
							demoMidi.tracks[i].controlChanges[
								midiControlCode.expression.toString()
							]
						softenCode = midiControlCode.expression
					}

					if (softenControl) {
						for (let i = 0; i < softenControl.length; i++) {
							const automation = softenControl[i]

							Tone.Transport.scheduleOnce((t) => {
								Tone.Draw.schedule(
									() => {
										updateSoften(
											softenCode == midiControlCode.expression
												? 1 - automation.value
												: automation.value
										)
									},
									Math.max(t - drawOffset, 0)
								)
							}, automation.ticks + 'i')
						}
					}

					// // sustain -> sustain
					const sustainControl =
						demoMidi.tracks[i].controlChanges[
							midiControlCode.sustain.toString()
						]
					if (sustainControl) {
						for (let i = 0; i < sustainControl.length; i++) {
							const automation = sustainControl[i]
							Tone.Transport.scheduleOnce((t) => {
								Tone.Draw.schedule(
									() => {
										updateSustain(automation.value)
									},
									Math.max(t - drawOffset, 0)
								)
							}, automation.ticks + 'i')
						}
					}

					// // ambience -> reverb
					const ambienceControl =
						demoMidi.tracks[i].controlChanges[
							midiControlCode.reverb.toString()
						]
					if (ambienceControl) {
						for (let i = 0; i < ambienceControl.length; i++) {
							const automation = ambienceControl[i]
							Tone.Transport.scheduleOnce((t) => {
								Tone.Draw.schedule(
									() => {
										updateAmbience(automation.value)
									},
									Math.max(t - drawOffset, 0)
								)
							}, automation.ticks + 'i')
						}
					}

					// i will cry if i add sostuneto so no

					// visuals
					demoMidi.tracks[i].notes.forEach((note) => {
						note.time = note.ticks + 'i'

						Tone.Transport.scheduleOnce((t) => {
							Tone.Draw.schedule(
								() => {
									attack(note.midi, note.velocity, true)
								},
								Math.max(t, 0)
							)
						}, note.ticks + 'i')
						Tone.Transport.scheduleOnce(
							(t) => {
								Tone.Draw.schedule(
									() => {
										release(note.midi, true)
									},
									Math.max(t, 0)
								)
							},
							note.ticks + note.durationTicks + 'i'
						)
					})
				}
				for (let i = 0; i < tracksCount; i++) {
					demoParts.current[i] = new Tone.Part((t, note) => {
						const attack = note.duration
						const release = t

						// const playBy = demoVoices.current[i]
						const playBy = liveSampler.current
						playBy.triggerAttackRelease(
							Tone.Frequency(note.midi, 'midi').toNote(),
							attack,
							release,
							note.velocity
						)
					}, demoMidi.tracks[i].notes).start(0)
				}

				Tone.Transport.start()
			}
		}
	}, [demo, isDemoing])

	useEffect(() => {
		const unsubscribeReady = usePlay.subscribe(
			(state) => state.ready,
			(ready) => {
				if (ready && Tone.context.state !== 'running') {
					Tone.start()
				}
			}
		)

		const unsubscribeBPM = usePlay.subscribe(
			(state) => state.bpm,
			(bpm) => {
				Tone.Transport.bpm.value = bpm
			}
		)

		const unsubscribeTimeSignature = usePlay.subscribe(
			(state) => state.timeSignature,
			(timeSignature) => {
				Tone.Transport.timeSignature = timeSignature
			}
		)

		const unsubscribeSounds = usePlay.subscribe(
			(state) => state,
			(curr) => {
				if (curr.samplerReady) {
					liveSampler.current.chain(
						// thePitch.current,
						// theFilter.current,
						theReverb.current,
						Tone.getDestination()
					)
					playLive(curr)
				}
			}
		)

		return () => {
			unsubscribeReady()
			unsubscribeBPM()
			unsubscribeTimeSignature()
			unsubscribeSounds()
		}
	}, [])

	//wala hayup ka
	return
}
