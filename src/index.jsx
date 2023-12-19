import './style.scss'
// import * as THREE from 'three'
import { Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { Canvas } from '@react-three/fiber'
import { KeyboardControls } from '@react-three/drei'
import { Leva } from 'leva'

import { voicesProps } from './imports/audio'

import Scene from './experience/Scene.jsx'
import Ui from './experience/Ui.jsx'
import Sounds from './experience/Sounds.jsx'
import MobileFix from './experience/MobileFix.jsx'

import Midi from './controls/Midi.jsx'
import Keebs from './controls/Keebs.jsx'

import keebControl from './imports/keebControl'

const keebMap = []

for (let i = 0; i < keebControl.notes.length; i++) {
	const { keycode } = keebControl.notes[i]
	keebMap.push({ name: `keebPlay_${i}`, keys: [keycode] })
}

keebMap.push({ name: 'keebDemo', keys: [keebControl.demo.keycode] })

for (let i = 0; i < voicesProps.length; i++) {
	const { keycode } = keebControl.voices[i]
	keebMap.push({ name: `keebVoice_${i}`, keys: [keycode] })
}

for (const dir in keebControl.ambience) {
	const { keycode } = keebControl.ambience[dir]
	keebMap.push({ name: `keebAmbience_${dir}`, keys: [keycode] })
}
for (const ped in keebControl.pedals) {
	const { keycode } = keebControl.pedals[ped]
	keebMap.push({ name: `keebPedals_${ped}`, keys: [keycode] })
}

keebMap.push({ name: 'keebMetronome', keys: [keebControl.metronome.keycode] })

for (const dir in keebControl.transpose) {
	const { keycode } = keebControl.transpose[dir]
	keebMap.push({ name: `keebTranspose_${dir}`, keys: [keycode] })
}

for (const dir in keebControl.octave) {
	const { keycode } = keebControl.octave[dir]
	keebMap.push({ name: `keebOctave_${dir}`, keys: [keycode] })
}

const root = ReactDOM.createRoot(document.querySelector('#root'))

root.render(
	<>
		<Leva
			// oneLineLabels
			hideTitleBar
			collapsed={true}
			hidden={import.meta.env.MODE !== 'development'}
		/>
		<Suspense fallback={null}>
			<KeyboardControls map={keebMap}>
				<Canvas
					gl={{
						antialias: true,
						powerPreference: 'high-performance',
						// toneMapping: THREE.ACESFilmicToneMapping,
						// toneMappingExposure: .3,
						// useLegacyLights: true,
					}}
					shadows //dai mo ni lingawon pota
					camera={{
						fov: 45,
						near: 0.01,
						far: 200,
						position: [0, 3, 4],
					}}
				>
					<Scene />
				</Canvas>
				<Sounds />
				<Midi />
				<Keebs />
			</KeyboardControls>
		</Suspense>
		<MobileFix />
		<Ui />
	</>
)
