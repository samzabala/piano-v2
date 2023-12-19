/*
UI ng app: pang pretty pretty tsaka UX
*/
import './../scss/_Ui.scss'

import {
	useState,
	useEffect,
	useMemo,
	// useRef
} from 'react'
import { useProgress } from '@react-three/drei'

import usePlay from '../stores/usePlay'

import { demoProps } from '../imports/demo.js'

import ReactMarkdown from 'react-markdown'
import readme from './../../readme.md'
import rehypeRaw from 'rehype-raw'

import LoadingSpinner from '../parts/LoadingSpinner.jsx'
import LoadingBar from '../parts/LoadingBar.jsx'

import {
	// noteDurations,
	volumeRange,
	// timeSignatureBeatRange,
	bpmRange,
} from '../imports/helpers'

export default function Ui() {
	const ready = usePlay((state) => state.ready)
	const start = usePlay((state) => state.start)

	const bpm = usePlay((state) => state.bpm)
	const setBPM = usePlay((state) => state.setBPM)

	// const timeSignature = usePlay((state) => state.timeSignature)
	// const setTimeSignature = usePlay((state) => state.setTimeSignature)

	const volume = usePlay((state) => state.volume)
	const setVolume = usePlay((state) => state.setVolume)

	const controlsMapOn = usePlay((state) => state.controlsMapOn)
	const setControlMap = usePlay((state) => state.setControlMap)

	const midiControl = usePlay((state) => state.midiControl)
	const updateMidiControl = usePlay((state) => state.updateMidiControl)

	const midiInputs = usePlay((state) => state.midiInputs)

	const enableKeebs = usePlay((state) => state.enableKeebs)
	const disableKeebs = usePlay((state) => state.disableKeebs)

	const subtitle = usePlay((state) => state.subtitle)
	const isMobile = usePlay((state) => state.isMobile)

	const demo = usePlay((state) => state.demo)
	const isDemoing = usePlay((state) => state.isDemoing)

	const [showTransports, setShowTransports] = useState(false)

	const [showAbout, setShowAbout] = useState(false)

	const theAbout = useMemo(() => {
		const match = readme.match(/<div\s+id="about">([\s\S]*?)<\/div>/)
		return match ? match[1].trim() : ''
	}, [])

	const [hasMobileWarning, updateMobileWarning] = useState(true)
	const [hideSoundSpinner, setSoundSpinner] = useState(true)
	useEffect(() => {
		// window.addEventListener('keydown',handleNoteKeyDown)
		// window.addEventListener('keyup',handleNoteKeyup)

		// window.addEventListener('mousedown',handleNoteMouseDown)
		// window.addEventListener('mouseup',handleNoteMouseUp)
		// window.addEventListener('mouseleave',handleNoteMouseLeave)

		const unsubcribeSamplerReady = usePlay.subscribe(
			(state) => state.samplerReady,
			(currSamplerReady) => {
				setSoundSpinner(currSamplerReady)
			}
		)

		return () => {
			// window.removeEventListener('keydown',handleNoteKeyDown)
			// window.removeEventListener('keyup',handleNoteKeyup)

			// window.removeEventListener('mousedown',handleNoteMouseDown)
			// window.removeEventListener('mouseup',handleNoteMouseUp)
			unsubcribeSamplerReady()
		}
	}, [])

	const [showStart, setShowStart] = useState(false)
	// const showStartTimeOut = useRef()
	const { active, progress, errors, item, loaded, total } = useProgress()

	//fix the backwards loading bug happening what the heck
	const [progressWidth, setProgressWidth] = useState(0)
	const [lastTotal, setLastTotal] = useState(0)

	useEffect(() => {
		if (lastTotal !== total) {
			setLastTotal(total)
		}
	}, [active, total])

	useEffect(() => {
		let toSet

		if (progress == 100 && lastTotal !== total) {
			toSet = 99
		} else {
			if (progress > progressWidth) {
				toSet = Math.floor(progress) ?? 0
			}
		}

		if (toSet) setProgressWidth(toSet)
	}, [progress, lastTotal, total])

	useEffect(() => {
		if (import.meta.env.MODE == 'development') {
			console.log('active,', active)
			console.log('progress,', progress)
			console.log('errors,', errors)
			console.log('item,', item)
			console.log('loaded,', loaded)
			console.log('lastTotal,', lastTotal)
			console.log('total ', total)
			console.log('progressWidth ', progressWidth)
			console.log('--------')
		}
		// clearInterval(showStartTimeOut.current)

		// god what the fuck
		if (!active && progress == 100 && lastTotal == total && progressWidth == 100) {
			// showStartTimeOut.current = setTimeout(() => {
			setShowStart(true)
			// }, 200)
		}

		// return () => {
		// 	clearInterval(showStartTimeOut.current)
		// }
	}, [active, progress, errors, item, loaded, total, lastTotal, progressWidth])

	return (
		<>
			<div className='Ui hide-scrollbar'>
				{/* Transports */}
				<div className='Ui-item session-controls'>
					<button
						className={`button button-icon button-can-no-hover ${
							showTransports ? 'active' : ''
						}`}
						onClick={() => {
							setControlMap()
							setShowAbout(false)
							setShowTransports(!showTransports)
						}}
					>
						<i className='content-icon'>
							<svg
								xmlns='http://www.w3.org/2000/svg'
								height='24'
								viewBox='0 -960 960 960'
								width='24'
							>
								<path
									d='M520-600v-80h120v-160h80v160h120v80H520Zm120 480v-400h80v400h-80Zm-400 0v-160H120v-80h320v80H320v160h-80Zm0-320v-400h80v400h-80Z'
									fill='currentColor'
								/>
							</svg>
						</i>
						<span className='button-label'>Settings</span>
					</button>
					{showTransports && (
						<div className='session-controls-wrap'>
							<form className='session-controls-form hide-scrollbar button-group button-group-scroll'>
								{/* BPM */}
								<div
									className={`button-group session-controls-control session-controls-control-temp`}
								>
									<label
										htmlFor='bpm'
										className='button'
										onDoubleClick={(e) => {
											e.preventDefault()
											setBPM()
										}}
									>
										Tempo:
									</label>
									<input
										className='button button-constrict'
										id={'bpm'}
										type={'number'}
										title={
											isDemoing &&
											demoProps[demo].midi.header.tempos &&
											demoProps[demo].midi.header.tempos.length >
												1
												? "You can't change the tempo of a song that beats on its own drum!"
												: null
										}
										value={bpm}
										min={bpmRange[0]}
										max={bpmRange[1]}
										disabled={
											isDemoing &&
											demoProps[demo].midi.header.tempos &&
											demoProps[demo].midi.header.tempos.length >
												1
										}
										step={1}
										size={3}
										onBlur={() => {
											enableKeebs()
										}}
										onFocus={() => {
											disableKeebs()
										}}
										onChange={(e) => {
											setBPM(e.target.value)
										}}
										onClick={(e) => {
											e.stopPropagation()
										}}
									/>
								</div>

								{/* siggy */}
								{/* <div
									className={`button-group session-controls-control session-controls-control-tsig`}
								>
									<label
										htmlFor='tsNote'
										className='button'
										onDoubleClick={(e) => {
											e.preventDefault()
											setTimeSignature([])
										}}
									>
										Time Signature:
									</label>
									<select
										className='button button-constrict'
										id={'tsNote'}
										value={timeSignature[0]}
										onBlur={ () => {enableKeebs()} }
										onFocus={ () => {disableKeebs()} }
										onChange={(e) => {
											setTimeSignature([parseInt(e.target.value)])
											e.target.blur()
										}}
									>
										{noteDurations.map((n, i) => (
											<option value={n} key={i}>
												{n}
											</option>
										))}
									</select>
									<span className='label button button-constrict'>
										/
									</span>

									<input
										className='button button-constrict'
										id={'tsBeat'}
										type={'number'}
										value={timeSignature[1]}
										min={timeSignatureBeatRange[0]}
										max={timeSignatureBeatRange[1]}
										step={1}
										size={4}
										onBlur={ () => {enableKeebs()} }
										onFocus={ () => {disableKeebs()} }
										onChange={(e) => {
											setTimeSignature([
												,
												parseInt(e.target.value),
											])
										}}
									/>
								</div> */}

								{/* midi input */}
								<div
									className={`button-group session-controls-control session-controls-control-tsig`}
								>
									<label
										htmlFor='midiInput'
										className='button'
										disabled={!midiInputs || !midiInputs.size}
										onDoubleClick={(e) => {
											e.preventDefault()
											updateMidiControl(0)
										}}
									>
										MIDI Input:
									</label>
									<select
										className='button'
										id={'midiInput'}
										value={midiControl}
										onBlur={() => {
											enableKeebs()
										}}
										onFocus={() => {
											disableKeebs()
										}}
										disabled={!midiInputs || !midiInputs.size}
										onChange={(e) => {
											updateMidiControl(parseInt(e.target.value))
											e.target.blur()
										}}
									>
										{midiInputs && midiInputs.size ? (
											[...midiInputs.values()].map((input, i) => (
												<option value={i} key={i}>
													{input.name}
												</option>
											))
										) : (
											<option>No MIDI Devices found</option>
										)}
									</select>
								</div>

								{/* bolyum */}
								<div
									className={`button-group session-controls-control session-controls-control-volume`}
								>
									<label
										htmlFor='volume'
										className='button'
										onDoubleClick={(e) => {
											e.preventDefault()
											setVolume()
										}}
									>
										Volume:
									</label>
									<span className='button label'>
										<input
											id={'volume'}
											type={'range'}
											value={volume}
											min={volumeRange[0]}
											max={volumeRange[1]}
											step={0.1}
											onBlur={() => {
												enableKeebs()
											}}
											onFocus={() => {
												disableKeebs()
											}}
											onChange={(e) => {
												setVolume(e.target.value)
												e.target.blur()
											}}
										/>
									</span>
								</div>
							</form>
						</div>
					)}
				</div>

				{/* Maps */}
				<div className='Ui-item keyboard-control'>
					<button
						className={`button button-icon button-can-no-hover ${
							controlsMapOn == 'midi' ? 'active' : ''
						}`}
						onClick={() => {
							setShowAbout(false)
							setShowTransports(false)
							controlsMapOn == 'midi'
								? setControlMap()
								: setControlMap('midi')
						}}
					>
						<i className='content-icon'>
							<svg
								xmlns='http://www.w3.org/2000/svg'
								height='24'
								viewBox='0 -960 960 960'
								width='24'
							>
								<path
									d='M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h130v-180h-10q-17 0-28.5-11.5T280-420v-340h-80v560Zm430 0h130v-560h-80v340q0 17-11.5 28.5T640-380h-10v180Zm-240 0h180v-180h-10q-17 0-28.5-11.5T520-420v-340h-80v340q0 17-11.5 28.5T400-380h-10v180Z'
									fill='currentColor'
								/>
							</svg>
						</i>
						<span className='button-label'>Show MIDI Map</span>
					</button>
				</div>
				<div className='Ui-item keyboard-control'>
					<button
						className={`button button-icon button-can-no-hover ${
							controlsMapOn == 'keebs' ? 'active' : ''
						}`}
						onClick={() => {
							setShowAbout(false)
							setShowTransports(false)
							controlsMapOn == 'keebs'
								? setControlMap()
								: setControlMap('keebs')
						}}
					>
						<i className='content-icon'>
							<svg
								xmlns='http://www.w3.org/2000/svg'
								height='24'
								viewBox='0 -960 960 960'
								width='24'
							>
								<path
									d='M160-200q-33 0-56.5-23.5T80-280v-400q0-33 23.5-56.5T160-760h640q33 0 56.5 23.5T880-680v400q0 33-23.5 56.5T800-200H160Zm0-80h640v-400H160v400Zm160-40h320v-80H320v80ZM200-440h80v-80h-80v80Zm120 0h80v-80h-80v80Zm120 0h80v-80h-80v80Zm120 0h80v-80h-80v80Zm120 0h80v-80h-80v80ZM200-560h80v-80h-80v80Zm120 0h80v-80h-80v80Zm120 0h80v-80h-80v80Zm120 0h80v-80h-80v80Zm120 0h80v-80h-80v80ZM160-280v-400 400Z'
									fill='currentColor'
								/>
							</svg>
						</i>
						<span className='button-label'>Show Keebs Map</span>
					</button>
				</div>

				{/* Credits n Info and shit */}
				<div className='Ui-item info'>
					<button
						className={`button button-icon button-can-no-hover ${
							showAbout ? 'active' : ''
						}`}
						onClick={() => {
							setControlMap()
							setShowTransports(false)
							setShowAbout(!showAbout)
						}}
					>
						<i className='content-icon'>
							<svg
								xmlns='http://www.w3.org/2000/svg'
								height='24'
								viewBox='0 -960 960 960'
								width='24'
							>
								<path
									d='M424-320q0-81 14.5-116.5T500-514q41-36 62.5-62.5T584-637q0-41-27.5-68T480-732q-51 0-77.5 31T365-638l-103-44q21-64 77-111t141-47q105 0 161.5 58.5T698-641q0 50-21.5 85.5T609-475q-49 47-59.5 71.5T539-320H424Zm56 240q-33 0-56.5-23.5T400-160q0-33 23.5-56.5T480-240q33 0 56.5 23.5T560-160q0 33-23.5 56.5T480-80Z'
									fill='currentColor'
								/>
							</svg>
						</i>
						<span className='button-label'>About</span>
					</button>

					{showAbout ? (
						<div className='info-overlay overlay overlay-opaque'>
							<div className='info-frame'>
								<div className='info-contents'>
									<div className='info-utility'>
										<a
											href='#'
											onClick={(e) => {
												e.preventDefault()
												setShowAbout(false)
											}}
										>
											Close
										</a>
									</div>
									<h1>Piano v2</h1>
									<ReactMarkdown
										rehypePlugins={[rehypeRaw]}
										skipHtml={false}
									>
										{theAbout}
									</ReactMarkdown>
									<hr />
									<a
										href='https://github.com/samzabala/piano-v2'
										target='_blank'
										rel='noreferrer'
									>
										Github
									</a>{' '}
									|{' '}
									<a
										href='https://samzabala.space/miniprojects/three/'
										target='_blank'
										rel='noreferrer'
									>
										Legacy
									</a>
									<h6 className='mine-bitch'>
										built by{' '}
										<a
											href='http://samzabala.com'
											target='_blank'
											rel='noreferrer'
										>
											Sam Zabala
										</a>
										.
									</h6>
								</div>
							</div>
						</div>
					) : null}
				</div>
			</div>

			{/* No shitty screen sizes and pointers allowed. unless user wants to im not their mom */}
			{hasMobileWarning && isMobile ? (
				<div className='overlay'>
					<div className='overlay-contents'>
						<p>
							Features are limited for this device. <br />
							For a better experience, a device with a larger screen is
							recommended.
						</p>
						<a
							href='#'
							onClick={(e) => {
								e.preventDefault()
								updateMobileWarning(false)
							}}
							className='button'
						>
							No, shut up I want to suffer &gt;:(
						</a>
					</div>
				</div>
			) : null}

			{/* warn that bitch */}

			{subtitle ? <div className='subtitle'>{subtitle}</div> : null}

			{/* sampler spinner */}
			<LoadingSpinner text={'Loading sounds....'} hide={hideSoundSpinner} />

			{/* docload */}
			<LoadingBar
				text={`${progressWidth}% Loading...`}
				buttonText={'Start Playing'}
				showButton={showStart}
				onClick={(e) => {
					e.preventDefault()
					start()
				}}
				hide={ready}
				// width={Math.floor(progressWidth / 10)}
				width={progressWidth}
				// width={Math.floor(progresss)}
			/>
		</>
	)
}
