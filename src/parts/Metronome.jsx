/*
Metronome: Tiktok by Kesha
*/
import * as Tone from 'tone'
import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'

import usePlay from './../stores/usePlay.jsx'
import { handleCursorPointer, handleCursorRevert } from './../imports/helpers'

import { getPrimitiveNodes } from './../imports/model'
import { SharedMaterial } from './../imports/materials'

export default function Model({ objProps, materialProps }) {
	//states n helpers
	const bpm = usePlay((state) => state.bpm)

	const focusOn = usePlay((state) => state.focusOn)

	const metronomeSeed = usePlay((state) => state.metronomeSeed)
	const liveMetronome = usePlay((state) => state.liveMetronome)
	const dieMetronome = usePlay((state) => state.dieMetronome)

	const ticker = useRef()
	const angle = Math.PI * 0.2
	const [currentTime, setCurrentTime] = useState(0)

	// gumana ka pocha
	useFrame(
		(state, delta) => {
			if (ticker.current) {
				let rotation = 0
				// hamal sana may math

				if (metronomeSeed > 0) {
					// lord help me
					setCurrentTime((prevTime) => prevTime + delta)

					// kasi kwan yung 4 nagiging 8 basta nasilayan ko bASTA MATH
					const rate = Tone.Time('2n').toSeconds()

					// sabi daw ni chatgpt gento daw
					// nirapaka ko baga si chatgpt nang matao ako ning maayos na math maski na di ko maexplain explain saiya. tenkyu kuya chatgpt
					// gento gento
					rotation =
						Math.sin((2 * Math.PI * currentTime) / rate - Math.PI * 0.5) *
						angle

					// console.clear()
					// console.log(Tone.Transport.context.currentTime)
					// console.log('curr',currentTime)
					// console.log('delta',delta)
					// console.log('metronseed',metronomeSeed)
					// console.log('rate',rate)
					// console.log('rotation',rotation)
				} else {
					// console.log('not bitchin')
				}

				ticker.current.rotation.z = rotation
			}
		},
		[metronomeSeed, bpm]
	)

	//listeners
	const handleToggleMetronome = (e) => {
		if (focusOn == 'metronome') {
			e.stopPropagation()
			metronomeSeed > 0 ? dieMetronome() : liveMetronome()
		}
	}

	// model shits
	const nodes = getPrimitiveNodes()

	return (
		<group {...objProps} dispose={null}>
			<mesh
				castShadow
				ref={ticker}
				onClick={handleToggleMetronome}
				geometry={nodes.metronomeDick.geometry}
				position={[0, -0.773, -0.537]}
				// position={[8.157, 15.217, -1.717]}
				rotation-x={0.151}
			>
				<SharedMaterial {...materialProps} />
			</mesh>
			<mesh
				castShadow
				receiveShadow
				onPointerEnter={handleCursorPointer}
				onPointerLeave={handleCursorRevert}
				onClick={handleToggleMetronome}
				geometry={nodes.metronomeBod.geometry}
			>
				<SharedMaterial {...materialProps} />
			</mesh>
		</group>
	)
}
