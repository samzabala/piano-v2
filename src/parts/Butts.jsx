/*
Butt..ons: the things aside from keys you make bloopies to and it does things
*/
import { useRef, useState, useEffect } from 'react'
import { addEffect } from '@react-three/fiber'
import { useGesture } from '@use-gesture/react'

import usePlay from './../stores/usePlay.jsx'
import {
	handleCursorPointer,
	handleCursorRevert,
	rainbowColors,
} from './../imports/helpers'

import { getPrimitiveNodes } from './../imports/model'
import { SharedMaterial, ButtMaterial } from './../imports/materials'
import { voicesProps } from './../imports/audio'

export default function Model({ materialProps }) {
	//states n helpers
	const transpose = usePlay((state) => state.transpose)
	const setTranspose = usePlay((state) => state.setTranspose)

	const focusOn = usePlay((state) => state.focusOn)

	const setSubtitle = usePlay((state) => state.setSubtitle)
	const isMobile = usePlay((state) => state.isMobile)

	const voice = usePlay((state) => state.voice)
	const updateVoice = usePlay((state) => state.updateVoice)

	const demo = usePlay((state) => state.demo)
	const isDemoing = usePlay((state) => state.isDemoing)
	const liveDemo = usePlay((state) => state.liveDemo)
	const dieDemo = usePlay((state) => state.dieDemo)

	// const ambience = usePlay((state) => state.ambience)
	const toggleAmbienceInProgress = usePlay((state) => state.toggleAmbienceInProgress)
	const updateAmbience = usePlay((state) => state.updateAmbience)

	// ambience shit
	const knoRotationLimit = Math.PI * -1.5 // 1.815
	const ambienceController = useRef()
	const [knobRotation, setKnobRotaion] = useState(0)

	const subtitleText = `This feature isn't supported for your device yet :/`
	const subtitleTimeout = useRef(null)
	const subtitleDuration = 4000

	const initSubTitle = () => {
		clearTimeout(subtitleTimeout.current)
		setSubtitle(subtitleText)
		subtitleTimeout.current = setTimeout(() => {
			setSubtitle('')
		}, subtitleDuration)
	}

	const bindKnob = useGesture(
		{
			onDrag: ({ offset: [ox] }) => {
				if (ambienceController.current && focusOn == 'tactile') {
					toggleAmbienceInProgress(true)

					document.body.style.cursor = 'ew-resize'
					// Calculate newAmbience by normalizing ox within the bounds
					const min = -50 // Bottom bound
					const max = 50 // Top bound
					const newAmbience = (ox - min) / (max - min)

					// console.log('off', ox);
					// console.log('mov', mx);
					// console.log('d', newAmbience);

					// setKnobRotaion(knoRotationLimit * multiplier)
					updateAmbience(newAmbience)

					// console.log('dragging')
				}
			},
			onDragEnd: () => {
				toggleAmbienceInProgress(false)
				document.body.style.cursor = 'default'

				// if (ambienceController.current && focusOn == 'tactile') {
				//     // Calculate newAmbience by normalizing ox within the bounds
				//     const min = -50; // Bottom bound
				//     const max = 50; // Top bound
				//     const newAmbience = (ox - min) / (max - min);

				//     // console.log('off', ox);
				//     // console.log('mov', mx);
				//     // console.log('d', newAmbience);

				//     updateAmbience(newAmbience)
				//     console.log('drag is end')
				// }
			},
		},
		{
			drag: {
				pointerEvents: true,
				bounds: {
					right: 50,
					left: -50,
				},
				delay: 1000,
				axis: 'x',
			},
		}
	)

	const handleKnobReset = (e) => {
		e.stopPropagation()

		if (focusOn == 'tactile') {
			updateAmbience(0)
		}
	}

	useEffect(() => {
		const unsubscribeUpdateAmbience = addEffect(() => {
			const state = usePlay.getState()

			setKnobRotaion(state.ambience * knoRotationLimit)
		})

		return () => {
			unsubscribeUpdateAmbience()
		}
	}, [])

	const buttY = 11.264
	const buttZ = -4.18 // 4.264

	// *sharpay evans voice* trANSPOSE
	const transposeDownProps = {
		position: [3.794, buttY, buttZ],
		rotation: [-0.185, 0, 0],
	}
	const transposeDownController = useRef()

	const handleTransposeDown = (e) => {
		if (focusOn == 'tactile' && e.object) {
			e.stopPropagation()
			setTranspose(transpose - 1)
		}
	}

	const transposeUpProps = {
		position: [3.243, buttY, buttZ],
		rotation: [-0.185, 0, 0],
	}
	const transposeUpController = useRef()

	const handleTransposeUp = (e) => {
		if (focusOn == 'tactile' && e.object) {
			e.stopPropagation()
			setTranspose(transpose + 1)
		}
	}

	// the voice hi coach stell
	const voiceObjProps = [
		{
			position: [-1.558, buttY, buttZ],
			rotation: [-0.185, 0, 0],
		},

		{
			position: [-2.07, buttY, buttZ],
			rotation: [-0.185, 0, 0],
		},

		{
			position: [-2.583, buttY, buttZ],
			rotation: [-0.185, 0, 0],
		},

		{
			position: [-3.095, buttY, buttZ],
			rotation: [-0.185, 0, 0],
		},
	]
	const voiceControllers = Array(voicesProps.length).fill(useRef()) //tt, 214

	const handleTone = (e) => {
		if (focusOn == 'tactile' && e.object) {
			e.stopPropagation()
			if (voice !== e.object.voiceKey) {
				updateVoice(e.object.voiceKey)
			}
		}
	}

	// awit gagi
	const demoController = useRef()
	const [demoWasKilled, setDemoWasKilled] = useState(false)

	const handleDemoController = (e) => {
		if (!isMobile) {
			if (focusOn == 'tactile') {
				e.stopPropagation()

				if (!demoWasKilled) {
					liveDemo()
				}
				setDemoWasKilled(false)
			}
		} else {
			initSubTitle()
		}
	}

	const dieDemoTimeout = useRef(null)

	const handleDemoPointerDown = (e) => {
		if (!isMobile) {
			if (focusOn == 'tactile') {
				e.stopPropagation()

				dieDemoTimeout.current = setTimeout(() => {
					dieDemo(0)
					setDemoWasKilled(true)
				}, 1000)
			}
		} else {
			initSubTitle()
		}
	}

	const handleDemoPointerUp = (e) => {
		if (!isMobile) {
			if (focusOn == 'tactile') {
				e.stopPropagation()
				clearTimeout(dieDemoTimeout.current)
				dieDemoTimeout.current = null
			}
		} else {
			initSubTitle()
		}
	}

	//model shits
	const nodes = getPrimitiveNodes()

	return (
		<>
			<mesh
				// castShadow
				receiveShadow
				ref={ambienceController}
				knobFor={'ambience'}
				onPointerEnter={() => {
					document.body.style.cursor = 'grab'
				}} //eeee
				onPointerLeave={handleCursorRevert}
				geometry={nodes.ambience.geometry}
				position={nodes.ambience.position}
				rotation-x={-0.185}
				rotation-y={knobRotation} //knobRotation
				onDoubleClick={handleKnobReset}
				{...bindKnob()}
			>
				<SharedMaterial {...materialProps} />
			</mesh>

			<mesh
				// castShadow
				receiveShadow
				ref={transposeDownController}
				onClick={handleTransposeDown}
				onPointerEnter={handleCursorPointer}
				onPointerLeave={handleCursorRevert}
				geometry={nodes.butt.geometry}
				{...transposeDownProps}
			>
				<ButtMaterial
					isActive={transpose < 0 ? Math.abs(transpose / 12) : 0}
					{...materialProps}
				/>
			</mesh>

			<mesh
				// castShadow
				receiveShadow
				ref={transposeUpController}
				onClick={handleTransposeUp}
				onPointerEnter={handleCursorPointer}
				onPointerLeave={handleCursorRevert}
				geometry={nodes.butt.geometry}
				{...transposeUpProps}
			>
				<ButtMaterial
					isActive={transpose > 0 ? Math.abs(transpose / 12) : 0}
					{...materialProps}
				/>
			</mesh>

			<mesh
				// castShadow
				receiveShadow
				ref={demoController}
				onPointerDown={handleDemoPointerDown}
				onPointerUp={handleDemoPointerUp}
				onClick={handleDemoController}
				onPointerEnter={handleCursorPointer}
				onPointerLeave={handleCursorRevert}
				geometry={nodes.butt.geometry}
				position={[1.919, buttY, buttZ]}
				rotation={[-0.185, 0, 0]}
			>
				<ButtMaterial
					isActive={isDemoing}
					activeColor={rainbowColors[demo]}
					{...materialProps}
				/>
			</mesh>

			{voiceControllers.map((tc, i) => {
				return (
					<mesh
						// castShadow
						receiveShadow
						key={i}
						ref={tc}
						voiceKey={i}
						onClick={handleTone}
						onPointerEnter={handleCursorPointer}
						onPointerLeave={handleCursorRevert}
						geometry={nodes.butt.geometry}
						{...voiceObjProps[i]}
					>
						<ButtMaterial isActive={voice == i} {...materialProps} />
					</mesh>
				)
			})}
		</>
	)
}
