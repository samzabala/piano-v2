/*
so non sad beats ppl can play too. nerds
*/
import './../scss/_Keebs.scss'

import { useEffect, useMemo, useRef } from 'react'
import { useKeyboardControls } from '@react-three/drei'
import usePlay from '../stores/usePlay'
import { notes, notesLength, noteInRange, isNatural } from '../imports/helpers'
import keebControl from '../imports/keebControl'

function Keeb({
	keeb = '',
	midi = '',
	className = '',
	isPress = false,
	isEnabled = false,
	elProps,
}) {
	return (
		<label
			className={`button ${className} ${isPress ? 'active' : ''}  ${
				isEnabled ? 'enabled' : ''
			}`}
			{...elProps}
		>
			<span className='wrap-ellipsis'>{keeb}</span>
			<strong className='wrap-ellipsis'>{midi}</strong>
		</label>
	)
}

export default function Keebs() {
	//states n helpers
	const octaves = usePlay((state) => state.octaves)
	const octaveCodeOffset = usePlay((state) => state.octaveCodeOffset)
	const startNote = usePlay((state) => state.startNote)
	const endNote = usePlay((state) => state.endNote)

	const transpose = usePlay((state) => state.transpose)
	const setTranspose = usePlay((state) => state.setTranspose)

	const controlsMapOn = usePlay((state) => state.controlsMapOn)

	const canKeeb = usePlay((state) => state.canKeeb)
	const keebOctave = usePlay((state) => state.keebOctave)
	const setKeebOctave = usePlay((state) => state.setKeebOctave)

	const voice = usePlay((state) => state.voice)
	const updateVoice = usePlay((state) => state.updateVoice)

	const demo = usePlay((state) => state.demo)
	const isDemoing = usePlay((state) => state.isDemoing)
	const playingDemo = usePlay((state) => state.playingDemo)
	const liveDemo = usePlay((state) => state.liveDemo)
	const dieDemo = usePlay((state) => state.dieDemo)
	const swapDemo = usePlay((state) => state.swapDemo)

	const metronomeSeed = usePlay((state) => state.metronomeSeed)
	const liveMetronome = usePlay((state) => state.liveMetronome)
	const dieMetronome = usePlay((state) => state.dieMetronome)

	const ambience = usePlay((state) => state.ambience)
	const updateAmbience = usePlay((state) => state.updateAmbience)

	const pedals = usePlay((state) => {
		return {
			soften: state.soften,
			sostenuto: state.sostenuto,
			sustain: state.sustain,
		}
	})
	const updatePedals = usePlay((state) => {
		return {
			soften: state.updateSoften,
			sostenuto: state.updateSostenuto,
			sustain: state.updateSustain,
		}
	})

	const playing = usePlay((state) => state.playing)
	const attack = usePlay((state) => state.attack)
	const release = usePlay((state) => state.release)

	const middleOctave = 5

	const keebMidi = useMemo(() => {
		const keebMidi = []
		const octaveOffset = (keebOctave + octaveCodeOffset - 1) * notesLength

		keebControl.notes.map(({ keycode, char }, i) => {
			keebMidi.push(octaveOffset + i)
		})

		return keebMidi
	}, [keebOctave])

	const [subscribeKeebs] = useKeyboardControls()
	const currActiveKeys = useKeyboardControls((state) => state)

	const checkIfPlaying = (midiCode) => {
		return (
			playing.map(([m]) => m).includes(midiCode) ||
			playingDemo.map(([m]) => m).includes(midiCode)
		)
	}

	const dieDemoTimeout = useRef(null)

	//show thinnbgnbn
	useEffect(() => {
		const unsubscribeNotes = []

		for (let i = 0; i < keebControl.notes.length; i++) {
			unsubscribeNotes.push(
				subscribeKeebs(
					(state) => state[`keebPlay_${i}`],
					(keebPressed) => {
						if (canKeeb) {
							if (keebPressed) {
								attack(keebMidi[i])
							} else {
								release(keebMidi[i])
							}
						}
					}
				)
			)
		}

		const unsubscribeDemo = subscribeKeebs(
			(state) => state.keebDemo,
			(keebPressed) => {
				if (canKeeb) {
					if (keebPressed) {
						if (!isDemoing) {
							liveDemo()
						} else {
							swapDemo()
						}

						dieDemoTimeout.current = setTimeout(() => {
							dieDemo(0)
						}, 1000)
					} else {
						clearTimeout(dieDemoTimeout.current)
						dieDemoTimeout.current = null
					}
				}
			}
		)

		const unsubscribeVoices = []

		for (let i = 0; i < keebControl.voices.length; i++) {
			unsubscribeVoices.push(
				subscribeKeebs(
					(state) => state[`keebVoice_${i}`],
					(keebPressed) => {
						if (canKeeb) {
							if (keebPressed) {
								updateVoice(i)
							}
						}
					}
				)
			)
		}

		const unsubscribeAmbience = {}
		for (const dir in keebControl.ambience) {
			unsubscribeAmbience[dir] = subscribeKeebs(
				(state) => state[`keebAmbience_${dir}`],
				(keebPressed) => {
					if (canKeeb) {
						if (keebPressed) {
							updateAmbience(ambience + 0.1 * (dir == 'up' ? 1 : -1))
						}
					}
				}
			)
		}

		const unsubscribePedals = {}

		for (const ped in keebControl.pedals) {
			unsubscribePedals[ped] = subscribeKeebs(
				(state) => state[`keebPedals_${ped}`],
				(keebPressed) => {
					if (canKeeb) {
						if (keebPressed) {
							updatePedals[ped](1)
						} else {
							updatePedals[ped](0)
						}
					}
				}
			)
		}

		let metronomeIsDown
		const unsubscribeMetronome = subscribeKeebs(
			(state) => state.keebMetronome,
			(keebPressed) => {
				if (canKeeb) {
					if (keebPressed) {
						if (!metronomeIsDown) {
							metronomeSeed == 0 ? liveMetronome() : dieMetronome()
						}
						metronomeIsDown = true
					} else {
						metronomeIsDown = false
					}
				}
			}
		)

		const unsubscribeTranspose = {}
		for (const dir in keebControl.ambience) {
			unsubscribeTranspose[dir] = subscribeKeebs(
				(state) => state[`keebTranspose_${dir}`],
				(keebPressed) => {
					if (canKeeb) {
						if (keebPressed) {
							setTranspose(transpose + 1 * (dir == 'up' ? 1 : -1))
						}
					}
				}
			)
		}

		const unsubscribeOctave = {}
		for (const dir in keebControl.ambience) {
			unsubscribeOctave[dir] = subscribeKeebs(
				(state) => state[`keebOctave_${dir}`],
				(keebPressed) => {
					if (canKeeb) {
						if (keebPressed) {
							setKeebOctave(keebOctave + 1 * (dir == 'up' ? 1 : -1))
						}
					}
				}
			)
		}

		// const unsubscribeAll = subscribeKeebs(
		// 	(state) => state
		// )

		return () => {
			for (let i = 0; i < unsubscribeNotes.length; i++) {
				unsubscribeNotes[i]()
			}
			unsubscribeDemo()

			metronomeIsDown = null

			for (let i = 0; i < unsubscribeVoices.length; i++) {
				unsubscribeVoices[i]()
			}

			// unsubscribeAmbience()
			for (const dir in unsubscribeAmbience) {
				unsubscribeAmbience[dir]()
			}
			for (const pedal in unsubscribePedals) {
				unsubscribePedals[pedal]()
			}
			unsubscribeMetronome()
			for (const dir in unsubscribeTranspose) {
				unsubscribeTranspose[dir]()
			}
			for (const dir in unsubscribeOctave) {
				unsubscribeOctave[dir]()
			}

			// currActiveKeys.current = []
			// unsubscribeAll()
		}
	}, [
		canKeeb,
		playing,
		isDemoing,
		voice,
		ambience,
		pedals,
		metronomeSeed,
		keebOctave,
	])

	return (
		<>
			{controlsMapOn == 'keebs' ? (
				<div className='keebMap add-underlay'>
					<div className='keebMap-keys'>
						{keebControl.notes.map(({ keycode, char }, i) => {
							return (
								<Keeb
									key={i}
									className={`keebMap-keys-item
									keebMap-keys-item-note
									keebMap-keys-item-note-${isNatural(notes[i % notes.length]) ? 'white' : 'black'}
									keebMap-keys-item-note-${i}`}
									elProps={{
										disabled: !noteInRange(keebMidi[i], {
											octaves,
											octaveCodeOffset,
											startNote,
											endNote,
										}),
									}}
									isPress={
										currActiveKeys[`keebPlay_${i}`] ||
										checkIfPlaying(keebMidi[i])
									}
									keeb={char}
									midi={
										notes[
											(i + transpose + notesLength) % notesLength
										]
									}
								/>
							)
						})}

						{/* demo keebs */}
						<Keeb
							className={`keebMap-keys-item
					keebMap-keys-item-demo`}
							isPress={currActiveKeys[`keebDemo`]}
							isEnabled={isDemoing}
							keeb={keebControl.demo.char}
							midi={'demo'}
						/>

						{/* kwan boses */}
						{keebControl.voices.map(({ keycode, char }, i) => {
							return (
								<Keeb
									key={i}
									className={`keebMap-keys-item keebMap-keys-item-voice keebMap-keys-item-voice-${i}`}
									isPress={currActiveKeys[`keebVoice_${i}`]}
									isEnabled={voice == i}
									keeb={char}
									midi={`Voice ${i + 1}`}
								/>
							)
						})}

						{/* ambience */}
						{Object.keys(keebControl.ambience).map((dir) => {
							return (
								<Keeb
									key={dir}
									className={`keebMap-keys-item keebMap-keys-item-ambience keebMap-keys-item-ambience-${dir}`}
									isPress={currActiveKeys[`keebAmbience_${dir}`]}
									keeb={keebControl.ambience[dir].char}
									midi={`Amb ${dir == 'up' ? '+' : '-'}`}
								/>
							)
						})}

						{/* pidal */}
						{Object.keys(keebControl.pedals).map((ped) => {
							return (
								<Keeb
									key={ped}
									className={`keebMap-keys-item keebMap-keys-item-pedal keebMap-keys-item-pedal-${ped}`}
									isPress={
										currActiveKeys[`keebPedals_${ped}`] ||
										pedals[ped] > 0
									}
									keeb={keebControl.pedals[ped].char}
									midi={ped}
								/>
							)
						})}

						{/* metroboi keebs */}
						<Keeb
							className={`keebMap-keys-item keebMap-keys-item-metronome`}
							isPress={currActiveKeys[`keebMetronome`]}
							isEnabled={metronomeSeed > 0}
							keeb={keebControl.metronome.char}
							midi={'metronome'}
						/>

						{/* pedal transposition */}
						{Object.keys(keebControl.transpose).map((dir) => {
							return (
								<Keeb
									key={dir}
									className={`keebMap-keys-item keebMap-keys-item-transpose keebMap-keys-item-transpose-${dir}`}
									isPress={currActiveKeys[`keebTranspose_${dir}`]}
									isEnabled={
										(dir == 'up' && transpose > 0) ||
										(dir == 'down' && transpose < 0)
									}
									keeb={keebControl.transpose[dir].char}
									midi={`Note ${dir == 'up' ? '+' : '-'}`}
								/>
							)
						})}
						{Object.keys(keebControl.octave).map((dir) => {
							return (
								<Keeb
									key={dir}
									className={`keebMap-keys-item keebMap-keys-item-octave keebMap-keys-item-octave-${dir}`}
									isPress={currActiveKeys[`keebOctave_${dir}`]}
									isEnabled={
										(dir == 'up' && keebOctave > middleOctave) ||
										(dir == 'down' && keebOctave < middleOctave)
									}
									keeb={keebControl.octave[dir].char}
									midi={`Octave ${dir == 'up' ? '+' : '-'}`}
								/>
							)
						})}
					</div>
				</div>
			) : null}
		</>
	)
}
