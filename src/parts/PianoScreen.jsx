/*
Screen UI: pang pretty pretty lang
*/

import './../scss/_PianoScreen.scss'

import { useRef } from 'react'
import {
	Html,
	// Decal,
	// RenderTexture,
	// OrthographicCamera,
	// Text,
	// Merged,
	// Center
} from '@react-three/drei'

import { useControls } from 'leva'

import usePlay from '../stores/usePlay.jsx'

import { getPrimitiveNodes } from '../imports/model.jsx'
import { SharedMaterial } from '../imports/materials.jsx'
import { voicesProps } from '../imports/audio'
import { demoProps } from '../imports/demo'

export default function PianoScreen({ materialProps, objProps = {} }) {
	//states and helpers
	const transpose = usePlay((state) => state.transpose)

	const voice = usePlay((state) => state.voice)

	const isMobile = usePlay((state) => state.isMobile)

	const demo = usePlay((state) => state.demo)
	const isDemoing = usePlay((state) => state.isDemoing)

	const soften = usePlay((state) => state.soften)
	const sostenuto = usePlay((state) => state.sostenuto)
	const sustain = usePlay((state) => state.sustain)

	const screenModel = useRef()

	const { background, foreground } = useControls('Piano Ui', {
		background: {
			label: 'Background',
			value: '#5c629c', //b00b1E
			transient: false,
			// onChange: (v) => {
			// 	document.body.style.setProperty('--pianoScreen-background', v)
			// },
		},
		foreground: {
			label: 'Foreground',
			value: '#ddffff', //b00b1E
			transient: false,
			// onChange: (v) => {
			// 	document.body.style.setProperty('--pianoScreen-foreground', v)
			// },
		},
	})

	// const fontProps = {
	// 	font: './fonts/04b_08/04b_08.woff',
	// 	fontWeight: 'bolder',
	// 	letterSpacing: 0.01,
	// 	lineHeight: .75,
	// 	characters: 'abcdefghijklmnopqrstuvwxyz0123456789:+-'
	// }

	const nodes = getPrimitiveNodes()

	return (
		<group
			onClick={(e) => {
				e.stopPropagation()
			}}
			position={[0, 11.24, -3.92]} // 3.91
			rotation={[1.386, 0, 0]}
			{...objProps}
		>
			<mesh geometry={nodes.pianoScreenPlaceholder.geometry} ref={screenModel}>
				{/* <planeGeometry args={[2,.669]} /> */}
				<SharedMaterial {...materialProps} />
				{/* <meshBasicMaterial color={background} /> */}
			</mesh>

			{!isMobile ? (
				<Html
					wrapperClass='pianoScreen-Html'
					touchAction={'none'}
					// prepend
					center
					// fullScreen
					distanceFactor={3.98}
					zIndexRange={[99, 1]}
					// portal={ screenModel }
					transform
					// sprite
					occlude
					// occlude='blending'

					// scale={0.392}
					scale={0.4999}
					// castShadow
					// receiveShadow
					// material={<SharedMaterial color={'#384488'} frustumCulled={false} />}
					style={{ pointerEvents: 'none' }}
					// position-y={0.001}
					rotation-y={Math.PI}
					position-z={-0.029}
					onClick={(e) => {
						e.stopPropagation()
					}}
				>
					<div
						style={{ transform: 'scale(1.999)' }}
						className='pianoScreen-wrap'
						onClick={(e) => {
							e.stopPropagation()
						}}
					>
						<div
							className='pianoScreen'
							style={{
								'--pianoScreen-background': background,
								'--pianoScreen-foreground': foreground,
							}}
						>
							<span className='pianoScreen-item pianoScreen-item-voiceIndex'>
								<span>
									{voice + 1 < 99 ? `00${voice + 1}` : voice + 1}
								</span>
							</span>
							<span className='pianoScreen-item pianoScreen-item-voiceName wrap-ellipsis'>
								<span>{voicesProps[voice].name}</span>
							</span>
							<span className='pianoScreen-item pianoScreen-item-pedalStats'>
								<span
									className='pianoScreen-item-pedalStats-ped pianoScreen-item-pedalStats-ped-soft'
									style={{
										'--pianoScreen-ped-threshold': soften,
									}}
								>
									<span>Soften</span>
								</span>
								<span
									className='pianoScreen-item-pedalStats-ped pianoScreen-item-pedalStats-ped-sostenuto'
									style={{
										'--pianoScreen-ped-threshold': sostenuto,
									}}
								>
									<span>Sostenuto</span>
								</span>
								<span
									className='pianoScreen-item-pedalStats-ped pianoScreen-item-pedalStats-ped-sustain'
									style={{
										'--pianoScreen-ped-threshold': sustain,
									}}
								>
									<span>Sustain</span>
								</span>
							</span>
							<span className='pianoScreen-item pianoScreen-item-playStats'>
								{isDemoing && (
									<span
										className={
											'pianoScreen-item-playStats-stat pianoScreen-item-playStats-stat-demo'
										}
									>
										<strong>Demo</strong>
										<div className='wrap-ellipsis'>
											{demoProps[demo].tag}
										</div>
									</span>
								)}
								<span
									className={
										'pianoScreen-item-playStats-stat pianoScreen-item-playStats-stat-transpose'
									}
								>
									T :{transpose > 0 ? '+' : ''}
									{transpose}
								</span>
							</span>
						</div>
					</div>
				</Html>
			) : null}
		</group>
	)
}
