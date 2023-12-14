/*
Experience: the whole butt
*/

// TODO safari is being a bitch with shadows and the html helper
import { useRef, useState, useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import {
	Environment,
	// ContactShadows,
	Shadow,
	// AccumulativeShadows,
	Center,
	// OrbitControls,
	PresentationControls,
	Circle,
	MeshReflectorMaterial,
	useKeyboardControls,
} from '@react-three/drei'
// import { BlendFunction } from 'postprocessing'
import { SMAA, Bloom, EffectComposer } from '@react-three/postprocessing'

import { useControls } from 'leva'
import { Perf } from 'r3f-perf' //performance tracker

import usePlay from '../stores/usePlay.jsx'

import Piano from '../parts/Piano.jsx'
import PianoScreen from '../parts/PianoScreen.jsx'
import Keys from '../parts/Keys.jsx'
import Butts from '../parts/Butts.jsx'
import Pedals from '../parts/Pedals.jsx'
import Metronome from '../parts/Metronome.jsx'

import keebControl from '../imports/keebControl.js'

import { getPolarColor, notes, notesLength } from '../imports/helpers.js'

export default function Scene() {
	//states n helpers
	const ready = usePlay((state) => state.ready)

	const octaves = usePlay((state) => state.octaves)
	const octaveCodeOffset = usePlay((state) => state.octaveCodeOffset)
	const startNote = usePlay((state) => state.startNote)
	const endNote = usePlay((state) => state.endNote)

	const keebOctave = usePlay((state) => state.keebOctave)

	const focusOn = usePlay((state) => state.focusOn)
	const setFocus = usePlay((state) => state.setFocus)

	//did u know keys shift a bit when u push this pedal because strings? ako din. galeng :O
	const soften = usePlay((state) => state.soften)

	const directionalLight = useRef()
	// useHelper(directionalLight, THREE.DirectionalLightHelper, 1 )

	// const camera = useRef()

	// const envFiles = [
	// 	'./environment/3/px.png',
	// 	'./environment/3/nx.png',
	// 	'./environment/3/py.png',
	// 	'./environment/3/ny.png',
	// 	'./environment/3/pz.png',
	// 	'./environment/3/nz.png',
	// ]
	const envFiles = './environment/3/2k.hdr'

	// leva
	const { performance } = useControls('Dev', {
		performance: {
			value: false,
		},
	})

	const { background, primary } = useControls('Site Theme', {
		background: {
			value: '#ffc2bf', //b00b1E
			transient: false,
			onChange: (v) => {
				document.body.style.setProperty('--c-noot', v)
				document.body.style.setProperty('--c-noot-polar', getPolarColor(v))
			},
		},
		primary: {
			value: '#904276', //edbbbb
			transient: false,
			onChange: (v) => {
				document.body.style.setProperty('--c-primary', v)
				document.body.style.setProperty('--c-primary-polar', getPolarColor(v))
			},
		},
	})

	const { washIntensity, washThreshold } = useControls('Bloom', {
		washIntensity: {
			label: 'Wash Intensity',
			value: 0.31,
			step: 0.01,
			min: 0,
			max: 1,
		},
		washThreshold: {
			label: 'Wash Threshold',
			value: 0.0,
			step: 0.01,
			min: 0,
			max: 1,
		},
	})

	const { envMapIntensity, lightIntensity, lightPosition } = useControls(
		'Environment',
		{
			envMapIntensity: {
				label: 'Reflections',
				// value: 0.82,
				value: 0.69,
				min: 0,
				max: 2,
				step: 0.01,
			},
			lightIntensity: {
				label: 'Light Intensity',
				value: 4.69,
				min: 0,
				max: 69,
				step: 0.01,
			},
			lightPosition: {
				label: 'Light Position',
				value: { x: 9.11, y: 9.11, z: -10.8 },
				joystick: 'invertY',
				step: 0.01,
			},
		}
	)
	const lightColor = useMemo(
		() => new THREE.Color('#ffffff').lerp(new THREE.Color(background), 0.2),
		[background]
	)

	//keebs legend
	const [keebOctave_up, keebOctave_down] = useKeyboardControls((state) => [
		state.keebOctave_up,
		state.keebOctave_down,
	])
	const setShowKeebsTimeout = useRef(null)
	const [showKeebsOctave, setShowKeebsOctave] = useState(false)
	useEffect(() => {
		if (ready && (keebOctave_up || keebOctave_down)) {
			clearTimeout(setShowKeebsTimeout.current)
			setShowKeebsOctave(true)
			setShowKeebsTimeout.current = setTimeout(() => {
				setShowKeebsOctave(false)
			}, 1000)
		}
	}, [keebOctave_up, keebOctave_down])

	//camera shit
	const tactileBody = useRef()
	const metronomeBody = useRef()
	const pianoBody = useRef()

	//smoothen boi
	const [smoothedCameraPosition] = useState(() => new THREE.Vector3())
	const [smoothedCameraTarget] = useState(() => new THREE.Vector3())
	// let smoothedCameraPosition
	// let smoothedCameraTarget
	// const [  cameraLastPosition,  setCameraLastPosition ] = useState(
	// 	() => new THREE.Vector3()
	// )

	// so we can see everything no matter how viewport and adjust camera stuff... words
	const vOffset = () => {
		const idealAspect = 0.5625
		const vRatio = window.innerHeight / window.innerWidth
		const vOffset = vRatio - idealAspect

		return vOffset
	}
	// smooooth
	const lerpFactor = 0.069

	// added based on subject
	const [posOffset] = useState({
		tactile: {
			position: {
				x: 0,
				y: 0.9,
				z: 1.5,
			},
			target: {
				x: 0,
				y: -0.5,
				z: 0,
			},
		},
		metronome: {
			position: {
				x: 0,
				y: 0.65,
				z: 1.1,
			},
			target: {
				x: -1.75,
				y: -0.15,
				z: -1,
			},
		},
		default: {
			position: {
				x: 0,
				y: 0,
				z: 0,
			},
			target: {
				x: 0,
				y: 0,
				z: 0,
			},
		},
	})

	// add based on viewport aspect ratio
	const [aspectOffset] = useState({
		tactile: {
			position: {
				x: 0,
				y: 1.8,
				z: 1.3,
			},
			target: {
				x: 0,
				y: 0,
				z: 0,
			},
		},
		metronome: {
			position: {
				x: 0.1,
				y: 0,
				z: 0.1,
			},
			target: {
				x: 0,
				y: 0,
				z: 0,
			},
		},
		default: {
			position: {
				x: 0,
				y: 0.5,
				z: 1.3,
			},
			target: {
				x: 0,
				y: 0,
				z: 0,
			},
		},
	})

	useFrame(({ camera }) => {
		const cameraPosition = new THREE.Vector3(
			camera.position.x,
			camera.position.y,
			camera.position.z
		)
		const cameraTarget = new THREE.Vector3()

		const v = vOffset()
		const offsetName = focusOn !== '' ? focusOn : 'default'

		let copyPos
		switch (focusOn) {
			case 'tactile':
				copyPos = tactileBody.current ? tactileBody.current.position : false
				break
			case 'metronome':
				copyPos = metronomeBody.current ? metronomeBody.current.position : false
				break
			default:
				copyPos = new THREE.Vector3(0, 3, 4)
		}

		if (copyPos) {
			cameraPosition.copy(copyPos)
			cameraPosition.x +=
				posOffset[offsetName].position.x +
				aspectOffset[offsetName].position.x * Math.max(v, 0)
			cameraPosition.y +=
				posOffset[offsetName].position.y +
				aspectOffset[offsetName].position.y * Math.max(v, 0)
			cameraPosition.z +=
				posOffset[offsetName].position.z +
				aspectOffset[offsetName].position.z * Math.max(v, 0)

			if (focusOn !== '') {
				cameraTarget.copy(copyPos)
				cameraTarget.x +=
					posOffset[offsetName].target.x +
					aspectOffset[offsetName].target.x * Math.max(v, 0)
				cameraTarget.y +=
					posOffset[offsetName].target.y +
					aspectOffset[offsetName].target.y * Math.max(v, 0)
				cameraTarget.z +=
					posOffset[offsetName].target.z +
					aspectOffset[offsetName].target.z * Math.max(v, 0)
			}
		}
		// // console.log('focused on',focusOn,copyPos,cameraPosition,cameraTarget)

		// if(isLerping || focusOn !== ''){

		smoothedCameraPosition.lerp(cameraPosition, lerpFactor)
		smoothedCameraTarget.lerp(cameraTarget, lerpFactor)

		// smoothedCameraPosition = cameraPosition
		// smoothedCameraTarget = cameraTarget

		camera.position.copy(smoothedCameraPosition)
		camera.lookAt(smoothedCameraTarget)
	})

	// events and shit
	const handleResetCamera = (e) => {
		e.stopPropagation()
		if (focusOn) {
			setFocus('')
		}
	}
	const handleTactileFocus = (e) => {
		e.stopPropagation()

		if (focusOn !== 'tactile') {
			setFocus('tactile')
		}
	}
	const handleMetronomeFocus = (e) => {
		e.stopPropagation()

		if (focusOn !== 'metronome') {
			setFocus('metronome')
		}
	}

	return (
		<>
			{performance ? <Perf position='bottom-right' antialias={false} /> : null}

			<EffectComposer multisampling={2}>
				<SMAA />
				<Bloom
					mipmapBlur
					intensity={washIntensity}
					luminanceThreshold={washThreshold}
					luminanceSmoothing={0.8}
				/>
			</EffectComposer>

			{/* <OrbitControls
				makeDefault
				enabled={focusOn == ''}
				enableDamping={true}
				maxPolarAngle={(Math.PI / 2) * 0.98}
				minPolarAngle={Math.PI * 0.25}
				maxAzimuthAngle={Math.PI * 0.5}
				minAzimuthAngle={Math.PI * 1.5}
				minDistance={2}
				maxDistance={6}
				minZoom={2}
				maxZoom={6}
				// camera={camera}
			/> */}
			<color args={[background]} attach='background' />
			<fog attach='fog' args={[background, 5, 100]} />

			<PresentationControls
				global
				enabled={!focusOn}
				rotation={[0, 0, 0]}
				cursor={false}
				polar={[Math.PI * -0.2, Math.PI * 0.5]}
				azimuth={[Math.PI * -0.5, Math.PI * 0.5]}
				zoom={1}
				config={{ mass: 3, tension: 400, friction: 69 }}
				snap={{ mass: 4, tension: 400, friction: 69 }}
			>
				<directionalLight
					ref={directionalLight}
					color={lightColor}
					intensity={lightIntensity}
					position-x={lightPosition.x}
					position-y={lightPosition.y}
					position-z={lightPosition.z}
					castShadow
					shadow-mapSize={[1024 * 2, 1024 * 2]}
					shadow-normalBias={0.0009}
					shadow-mapType={THREE.PCFSoftShadowMap}
				/>
				{/* <ambientLight color={'#ffffff'} intensity={.2} /> */}
				<Environment
					blur={0.9}
					files={envFiles}
					shadow-normalBias={0.0009}
					// background
				/>

				<Center>
					<group
						scale={0.1}
						rotation-y={Math.PI * 1}
						onPointerMissed={handleResetCamera}
					>
						<group
							ref={pianoBody}
							onClick={(e) => {
								e.stopPropagation()
							}}
						>
							<Piano
								materialProps={{
									// envMap: texture,
									envMapIntensity: envMapIntensity,
								}}
							/>
							<PianoScreen
								materialProps={{
									// envMap: texture,
									envMapIntensity: envMapIntensity,
								}}
							/>
						</group>
						<group ref={metronomeBody} onClick={handleMetronomeFocus}>
							<Metronome
								objProps={{
									// position: [-8.157, 15.99, -1.18],
									position: [8.157, 15.99, -1.18],
									'rotation-y': Math.PI * 0.07,
								}}
								materialProps={{
									// envMap: texture,
									envMapIntensity: envMapIntensity,
								}}
							/>
						</group>
						<group ref={tactileBody} onClick={handleTactileFocus}>
							{/* 0,10.55,5.01 */}
							<group position={[10.34 + -0.02 * soften, 10.58, -5.03]}>
								<Keys
									octaves={octaves}
									octaveCodeOffset={octaveCodeOffset}
									startNote={startNote}
									endNote={endNote}
									materialProps={{
										// envMap: texture,
										envMapIntensity: envMapIntensity,
									}}
								/>

								{showKeebsOctave && focusOn == 'tactile' && (
									<Keys
										octaves={
											keebOctave == octaves
												? 1
												: Math.ceil(
														keebControl.notes.length /
															notesLength
													)
										}
										octaveCodeOffset={
											octaveCodeOffset + keebOctave - 1
										}
										startNote={
											keebOctave == 1 ? startNote : notes[0]
										}
										endNote={
											keebOctave == octaves
												? endNote
												: notes[
														(keebControl.notes.length - 1) %
															notesLength
													]
										}
										color={primary}
										mode={'highlight'}
										objProps={{
											position: [-2.24 * (keebOctave - 1), 0, 0],
										}}
										materialProps={
											{
												// transparent: true,
												// opacity: 0,
												// size: 3
											}
										}
									/>
								)}
							</group>
							<Butts
								materialProps={{
									// envMap: texture,
									envMapIntensity: envMapIntensity,
								}}
							/>
							<Pedals
								materialProps={{
									// envMap: texture,
									envMapIntensity: envMapIntensity,
								}}
							/>
						</group>
					</group>

					<Shadow // ayo mas matino syang kausap
						color='black'
						position={[0, -0.01, 0.2]}
						colorStop={0}
						opacity={0.3}
						scale={3}
					/>

					<Circle
						onClick={(e) => {
							e.stopPropagation()
						}}
						position-y={-0.02}
						rotation-x={-Math.PI * 0.5}
						scale={100}
					>
						<MeshReflectorMaterial
							color={background}
							blur={[400, 100]}
							resolution={1024}
							mixBlur={0.69}
							mixStrength={0.31}
							depthScale={1}
							minDepthThreshold={0.96}
							metalness={0.1}
							roughness={0.89}
							envMapIntensity={envMapIntensity * 0.05}
							envMap={false}
						/>
					</Circle>
				</Center>
			</PresentationControls>
		</>
	)
}
