import * as THREE from 'three'
import { Suspense, useMemo } from 'react'
import { useTexture } from '@react-three/drei'

const ROUGHNESS = 1
const METALNESS = 0.8
const EMISSIVE = '#b6e5ff'
const COLOR_ACTIVE = '#0084ff'
const ENV_MAP_INTENSITY_DEFAULT = {
	value: 1,
	min: 0,
	max: 12,
}

// export function HighlightMaterial({color,size,materialProps}) {
// 	return <shaderMaterial
// 		uniforms={{
// 			uColor: {
// 			value: new THREE.Color(color)
// 			},
// 			uSize: {
// 			value: size
// 			},
// 		}}
// 		vertexShader={`
// 			// uniform float uSize;

// 			void main() {
// 			vec3 transformed = position * uSize / 100.0;
// 			gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
// 			// gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
// 			}
// 		`}
// 		fragmentShader={`
// 			uniform vec3 uColor;

// 			void main() {
// 				gl_FragColor = vec4(uColor, 1.0);
// 				// gl_FragColor = vec4( 1.0, 1.0, 0.0, 1.0)
// 			}
// 		`}
// 		depthWrite={false}
// 		color={color}
// 		// side={THREE.BackSide}
// 		{...materialProps}
// 	/>
// }

export function PianoScreenForeground({ color, materialProps }) {
	return <meshBasicMaterial {...color} {...materialProps} />
}
export function SharedMaterial(materialProps) {
	// Maps n Shit
	const [TheMap, MetalnessMap, RoughnessMap, BumpMap, EmissiveMap] = useTexture([
		'./model/UV.png',
		'./model/UV_ref.png',
		'./model/UV_refinvertalt.png',
		'./model/UV_bump.png',
		'./model/UV_glow.png',
	])

	// const TheMap = useTexture('./model/UV.jpg')
	// // const TheMap = useTexture('./model/UV_test.png')
	TheMap.flipY = false
	// // TheMap.colorSpace = THREE.SRGBColorSpace

	// const MetalnessMap = useTexture('./model/UV_ref.jpg')
	MetalnessMap.flipY = false
	// // MetalnessMap.colorSpace = THREE.SRGBColorSpace

	// const RoughnessMap = useTexture('./model/UV_refinvertalt.jpg')
	RoughnessMap.flipY = false
	// // RoughnessMap.colorSpace = THREE.SRGBColorSpace

	// const BumpMap = useTexture('./model/UV_bump.png')
	BumpMap.flipY = false
	// // BumpMap.colorSpace = THREE.SRGBColorSpace

	// const EmissiveMap = useTexture('./model/UV_glow.jpg')
	EmissiveMap.flipY = false

	return (
		<Suspense>
			<meshStandardMaterial
				map={TheMap}
				roughness={ROUGHNESS}
				roughnessMap={RoughnessMap}
				// roughnessMap={ SpecularMap }
				metalness={METALNESS}
				metalnessMap={MetalnessMap}
				// metalnessMap={ SpecularMap }
				bumpMap={BumpMap}
				bumpScale={0.02}
				emissive={EMISSIVE}
				emissiveMap={EmissiveMap}
				{...materialProps}
			/>
		</Suspense>
	)
}

export function ButtMaterial({ isActive = 0, materialProps, activeColor = EMISSIVE }) {
	const activeStrength = useMemo(
		() => (typeof isActive === 'boolean' ? (isActive ? 1 : 0) : isActive),
		[isActive]
	)

	// const [
	// 	MetalnessMap,
	// 	RoughnessMap,
	// ] = useTexture([
	// 	'./model/UV_ref.png',
	// 	'./model/UV_refinvertalt.png',
	// ])
	// MetalnessMap.flipY = false
	// // // MetalnessMap.colorSpace = THREE.SRGBColorSpace

	// // const RoughnessMap = useTexture('./model/UV_refinvertalt.jpg')
	// RoughnessMap.flipY = false
	// // // RoughnessMap.colorSpace = THREE.SRGBColorSpace

	const buttColor = useMemo(
		() =>
			new THREE.Color('#333333').lerp(
				new THREE.Color(activeColor),
				activeStrength
			),
		[isActive, activeColor]
	)

	return (
		<meshStandardMaterial
			color={buttColor}
			emissive={isActive ? activeColor : 'black'}
			emissiveIntensity={0 + 0.25 * activeStrength}
			roughness={ROUGHNESS * 0.9}
			// roughnessMap={ RoughnessMap }
			metalness={METALNESS * 0.5}
			// metalnessMap={ MetalnessMap }
			{...materialProps}
			// {...TheMaps}
		/>
	)
}
