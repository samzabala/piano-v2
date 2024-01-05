import * as THREE from 'three'
import {
	Suspense,
	useMemo,
	// useEffect,
	useRef,
} from 'react'
import { extend } from '@react-three/fiber'
import {
	shaderMaterial,
	// Outlines,
	useTexture,
} from '@react-three/drei'

const ROUGHNESS = 0.96
const METALNESS = 0.8
const EMISSIVE = '#b6e5ff'

//o hahahahaha betch
// https://codesandbox.io/p/sandbox/r3f-inverted-hull-z5tqm?file=%2Fsrc%2FSuzanne.js%3A41%2C23-41%2C41
export function HighlightMaterial({ color = EMISSIVE, materialProps }) {
	const theHighlight = useRef()

	const HullMaterial = shaderMaterial(
		{
			color: new THREE.Color('#ff005b'),
			size: 0.1,
		},
		/*glsl*/ `
	  uniform float size;
	  
	  void main() {
		vec3 transformed = position + normal * size/10.;
		gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(transformed, 1.);
	  }
	  `,
		/*glsl*/ `
	  uniform vec3 color;
	  
	  void main() {
		gl_FragColor = vec4(color, .8);
	  }
	  `
	)

	extend({ HullMaterial })

	return (
		<>
			{/* <meshStandardMaterial */}
			<hullMaterial
				color={color}
				ref={theHighlight}
				// receiveShadows
				transparent
				// roughness={1.5}
				// metalness={1}
				// emissive={color}
				// emissiveIntensity={0.2}
				// side={THREE.BackSide}
				depthWrite={false}
				{...materialProps}
			/>
			{/* <Outlines
				screenspace
				thickness={5}
				color={color}
				length={2}
				angle={ Math.PI * 1.5 }
			/> */}
		</>
	)
}

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
				bumpScale={1.2}
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
