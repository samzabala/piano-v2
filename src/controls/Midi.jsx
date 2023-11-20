/*
Let ppl play with ya boi with a midi controller
*/
import './../scss/_Midi.scss'

import { useEffect, useMemo, useRef } from 'react'
import usePlay from '../stores/usePlay.jsx'
import { midiControlCode, midiRange, volumeRange } from '../imports/helpers.js'

function Fader({ meta = '', midi = '', className = '', velocity = 0, elProps, info }) {
	return (
		<label
			style={{
				'--midi-velocity': velocity,
			}}
			className={`fader ${className}`}
			{...elProps}
		>
			<span className='button label'>
				<span className='wrap-ellipsis'>{meta.toLocaleUpperCase()}</span>
				<strong className='wrap-ellipsis'>CC: {midi}</strong>
				{info ? <strong>{info}</strong> : null}
			</span>
		</label>
	)
}

function Port({ meta = '', midi = '', className = '', velocity = 0, elProps, info }) {
	return (
		<label
			style={{
				'--midi-velocity': velocity,
			}}
			className={`port ${className}`}
			{...elProps}
		>
			<span className='button label'>
				<span className='wrap-ellipsis'>{meta.toLocaleUpperCase()}</span>
				<strong className='wrap-ellipsis'>CC: {midi}</strong>
				{info ? <strong>{info}</strong> : null}
			</span>
		</label>
	)
}

export default function Control() {
	//states n helpers
	const controlsMapOn = usePlay((state) => state.controlsMapOn)

	const midiControl = usePlay((state) => state.midiControl)
	const midiInputs = usePlay((state) => state.midiInputs)
	const setMidiInputs = usePlay((state) => state.setMidiInputs)

	const CC = usePlay((state) => {
		return {
			volume: state.volume,
			reverb: state.ambience,
			soften: state.soften,
			expression: state.soften,
			sostenuto: state.sostenuto,
			sustain: state.sustain,
		}
	})
	const setVolume = usePlay((state) => state.setVolume)
	const updateAmbience = usePlay((state) => state.updateAmbience)
	const updateSoften = usePlay((state) => state.updateSoften)
	const updateSostenuto = usePlay((state) => state.updateSostenuto)
	const updateSustain = usePlay((state) => state.updateSustain)

	const attack = usePlay((state) => state.attack)
	const release = usePlay((state) => state.release)

	const getVelocity = (velocity, meta) => {
		let toReturn = velocity
		if (meta == 'volume') {
			toReturn = (velocity - volumeRange[0]) / (volumeRange[1] - volumeRange[0])
		} else if (meta == 'expression') {
			toReturn = 1 - velocity
		}
		return toReturn
	}

	const handleMessage = (msg) => {
		const controlIndex = [...midiInputs.values()]
			.map((input) => input.id)
			.indexOf(msg.srcElement.id)

		try {
			if (controlIndex === midiControl) {
				const command = msg.data[0]
				const midiCode = msg.data[1]
				let velocity = msg.data.length > 2 ? msg.data[2] : 0

				// console.log(msg.srcElement)
				// console.log('command', command)
				// console.log('midiCode', midiCode)
				// console.log('velocity', velocity)
				// console.log('---')

				switch (command) {
					case 144: // attack note
						// console.log('case for attack',msg)
						if (velocity > 0) {
							attack(midiCode, velocity / midiRange[1])
						} else {
							release(midiCode)
						}
						break
					case 128: // release note
						// console.log('case for release',msg)
						release(midiCode)
						break
					case 176: // controller
						switch (midiCode) {
							case midiControlCode.volume:
								velocity =
									((velocity - midiRange[0]) *
										(volumeRange[1] - volumeRange[0])) /
										(midiRange[1] - midiRange[0]) +
									volumeRange[0]
								setVolume(
									Math.max(
										Math.min(velocity, volumeRange[1]),
										volumeRange[0]
									)
								)
								break
							case midiControlCode.reverb:
								updateAmbience(velocity / midiRange[1])
								break
							case midiControlCode.expression:
							case midiControlCode.soften:
								// console.log('old vel',velocity)

								//invert expression
								if (midiCode == midiControlCode.expression) {
									const oldVelocity = velocity
									// Map the velocity from the range [25, 127] to [0, 127]
									velocity = Math.floor(
										(velocity - 25) *
											(midiRange[1] / (midiRange[1] - 25))
									)

									// Invert the velocity by subtracting it from the maximum possible value (127)
									velocity = midiRange[1] - velocity
								}

								// console.log('code',midiCode)
								// console.log('vel',velocity)
								// console.log('for update ',(velocity) / midiRange[1])
								// console.log('---')

								updateSoften(velocity / midiRange[1])
								break
							case midiControlCode.sostenuto:
								updateSostenuto(velocity / midiRange[1])
								break
							case midiControlCode.sustain:
								updateSustain(velocity / midiRange[1])
								break
						}
						break
				}
			}
		} catch (error) {
			console.error('Error handling MIDI message:', error)
		}
	}

	const handleChange = (e) => {
		// if(e.port.state === 'disconnected') {
		// 	// setMidiInputs([])
		// } else {
		// 	console.log(e.port.state) // i mean it says connected???
		// }
	}

	// bless
	useMemo(() => {
		if (navigator.requestMIDIAccess) {
			navigator.requestMIDIAccess().then(
				(m) => {
					console.log('Can MIDI')
					setMidiInputs(m.inputs)

					m.onstatechange = (e) => {
						setMidiInputs(e.target.inputs)
					}
				},
				(e) => {
					console.error(`Failed to get MIDI access - ${e}`)
				}
			)
		}
	}, [])

	const midiEventHandlers = useRef([])
	useEffect(() => {
		if (midiInputs) {
			midiInputs.forEach((input, i) => {
				// https://www.smashingmagazine.com/2018/03/web-midi-api/
				// humanda kayong lahat makapanyarihan na ako mwahahahaha
				// also tenkyu smashing boi

				if (
					!midiEventHandlers.current.filter((obj) => input.id === obj.id)
						.length
				) {
					input.onmidimessage = handleMessage
					input.onstatechange = handleChange
					midiEventHandlers.current.push({
						input,
						id: input.id,
						handler: handleMessage,
					})
				}
			})
		}

		return () => {
			midiEventHandlers.current.forEach(({ input }) => {
				// Remove the event listener
				input.onmidimessage = null
				input.onstatechange = null
			})
			midiEventHandlers.current = []
		}
	}, [midiInputs, midiControl])

	return (
		<>
			{controlsMapOn == 'midi' ? (
				<div className='midiMap add-underlay'>
					{!midiInputs || !midiInputs.size ? (
						<h1 className='midiMap-error'>
							Uh oh. Either there was no keyboard found
							<br /> or it got disconnected D:
						</h1>
					) : null}
					<div
						className={`midiMap-inputs ${
							midiInputs && midiInputs.size ? '' : 'disabled'
						}`}
					>
						{Object.keys(CC).map((meta, i) => {
							// console.log(meta,CC[meta])
							const props = {
								key: meta,
								meta: meta,
								midi: midiControlCode[meta],
								velocity:
									midiInputs && midiInputs.size
										? getVelocity(CC[meta], meta)
										: 0,
								className: `midiMap-inputs-item midiMap-inputs-item-${meta}`,
								info:
									meta == 'expression'
										? 'If Soften MIDI events are not found, Expression will take over.'
										: '',
							}
							return meta == 'reverb' || meta == 'volume' ? (
								<Fader {...props} />
							) : (
								<Port {...props} />
							)
						})}
					</div>
				</div>
			) : null}
		</>
	)
}
