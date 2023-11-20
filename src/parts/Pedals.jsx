/*
Pedals: the things u step on when you make tinginingtingtingining sa piano
*/
import usePlay from '../stores/usePlay'
import { handleCursorPointer, handleCursorRevert } from '../imports/helpers'

import { getPrimitiveNodes } from '../imports/model.jsx'
import { SharedMaterial } from '../imports/materials.jsx'

export default function Model({ objProps, materialProps }) {
	//states n helpers
	const focusOn = usePlay((state) => state.focusOn)

	const soften = usePlay((state) => state.soften)
	const updateSoften = usePlay((state) => state.updateSoften)

	const sostenuto = usePlay((state) => state.sostenuto)
	const updateSostenuto = usePlay((state) => state.updateSostenuto)

	const sustain = usePlay((state) => state.sustain)
	const updateSustain = usePlay((state) => state.updateSustain)

	// todo rename in english because i forgot the word for it
	const pedalLubog = -0.6

	// listeners
	const handleSoft = (e) => {
		if (focusOn == 'tactile') {
			e.stopPropagation()
			const newSoften = soften > 0 ? 0 : 1
			updateSoften(newSoften)
		}
	}
	const handleSostenuto = (e) => {
		if (focusOn == 'tactile') {
			e.stopPropagation()
			const newSostenuto = sostenuto > 0 ? 0 : 1
			updateSostenuto(newSostenuto)
		}
	}
	const handleSustain = (e) => {
		if (focusOn == 'tactile') {
			e.stopPropagation()
			const newSustain = sustain > 0 ? 0 : 1
			updateSustain(newSustain)
		}
	}

	// model shits
	const nodes = getPrimitiveNodes()

	return (
		<group {...objProps} dispose={null} position-z={-3.136} position-y={0.99}>
			<mesh
				receiveShadow
				geometry={nodes.pedal_soft.geometry}
				position-x={1.516}
				position-y={pedalLubog * soften}
				onPointerEnter={handleCursorPointer}
				onPointerLeave={handleCursorRevert}
				onClick={handleSoft}
			>
				<SharedMaterial {...materialProps} />
			</mesh>
			<mesh
				receiveShadow
				geometry={nodes.pedal_sostenuto.geometry}
				position-x={0}
				position-y={pedalLubog * sostenuto}
				onPointerEnter={handleCursorPointer}
				onPointerLeave={handleCursorRevert}
				onClick={handleSostenuto}
			>
				<SharedMaterial {...materialProps} />
			</mesh>
			<mesh
				receiveShadow
				geometry={nodes.pedal_sustain.geometry}
				position-x={-1.516}
				position-y={pedalLubog * sustain}
				onPointerEnter={handleCursorPointer}
				onPointerLeave={handleCursorRevert}
				onClick={handleSustain}
			>
				<SharedMaterial {...materialProps} />
			</mesh>
		</group>
	)
}
