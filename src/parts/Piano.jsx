/*
Bodyodyodyody by Megan Thee Stallion
*/
import { getPrimitiveNodes } from '../imports/model.jsx'
import { SharedMaterial } from '../imports/materials.jsx'

export default function Model({ objProps, materialProps }) {
	const nodes = getPrimitiveNodes()

	return (
		<group
			{...objProps}
			onClick={(e) => {
				e.stopPropagation()
			}}
			dispose={null}
		>
			<mesh castShadow receiveShadow geometry={nodes.pianoGroupFuck.geometry}>
				<SharedMaterial {...materialProps} />
			</mesh>
		</group>
	)
}
