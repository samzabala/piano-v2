import { useGLTF } from '@react-three/drei'

const MODEL_PATH = './model/piano.web.glb'

export const getPrimitiveNodes = () => {
	const { nodes } = useGLTF(MODEL_PATH)

	return nodes
}
useGLTF.preload(MODEL_PATH)
