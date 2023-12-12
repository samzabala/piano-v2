/*
Keys: Hayup nihaw oh also it visualizes how u do and what the boopies... words
*/
import * as THREE from 'three'
import { useRef, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
// import { Outlines } from '@react-three/drei' //bitch doesnt work. yEET

import usePlay from '../stores/usePlay'
import {
	handleCursorPointer,
	handleCursorRevert,
	notes,
	notesLength,
	noteInRange,
	isNatural,
} from '../imports/helpers'

import { getPrimitiveNodes } from './../imports/model.jsx'
import { SharedMaterial, HighlightMaterial } from './../imports/materials.jsx'

export default function Model({
	octaves = 1,
	octaveCodeOffset = 0,
	startNote = 'C',
	endNote = 'B',
	objProps,
	materialProps,
	color = '',
	mode = 'interactive', //highlight,debug
}) {
	//states n helpers
	const transpose = usePlay((state) => state.transpose)

	const focusOn = usePlay((state) => state.focusOn)

	const keebOctave = usePlay((state) => state.keebOctave)
	// const hasKeebsMap = usePlay((state) => state.hasKeebsMap)

	const playingDemo = usePlay((state) => state.playingDemo)

	const isAmbiencing = usePlay((state) => state.isAmbiencing)

	const playing = usePlay((state) => state.playing)
	const attack = usePlay((state) => state.attack)
	const release = usePlay((state) => state.release)

	const getEventMusicData = (e) => {
		return e.object.userData.musicData
	}

	const getKeyPressAngle = (midiCode, noteName) => {
		const inLive = playing.filter(([m]) => m == midiCode)
		const inDemo = playingDemo.filter(([m]) => m == midiCode)

		if(!(inLive.length || inDemo.length)) return 0

		const maxPressW = Math.PI * -0.032
		const maxPressB = Math.PI * -0.018
		const minPressW = maxPressW + .02
		const minPressB = maxPressB + .02

		let velocity

		if(!velocity && inLive.length) 
			velocity = inLive[0][1]


		if(!velocity && inDemo.length) 
			velocity = inDemo[0][1]

		return isNatural(noteName)
			? Math.min(minPressW,maxPressW * velocity)
			: Math.min(minPressB,maxPressB * velocity)
	}
	const wOff = 0
	const bOff = -0.32
	const octaveposOff = -2.24

	const start = useMemo(() => notes.indexOf(startNote), [startNote])
	const end = useMemo(() => notes.indexOf(endNote), [endNote])
	const [count, countWhite, countBlack] = useMemo(() => {
		const count = octaves * notesLength - start - (notesLength - end - 1)
		let countWhite = 0

		for (let i = start; i < count + start; i++) {
			if (isNatural(notes[i % notesLength])) {
				countWhite++
			}
		}
		const countBlack = count - countWhite

		return [count, countWhite, countBlack]
	}, [start, end, octaves])

	const keysGroup = useRef() //si grupo kang component mismo
	const kEachAll = Array(count).fill(useRef()) // gabos
	const theWB = useRef() // i have to separate because three js be low key racist
	const theBK = useRef() // ooo waw

	const [kListeners, instancesWK, instancesBK] = useMemo(() => {
		const kListeners = []
		const instancesWK = []
		const instancesBK = []

		// factors of how far u kwan usog usog... basta in english yung galawin mong unti para kyut tingnan yung piano basta usog mo gagi

		for (let octave = 0; octave < octaves; octave++) {
			// ah shit it has math
			// https://computermusicresource.com/midikeys.html
			const midiCodeOffset = (octave + octaveCodeOffset) * notesLength

			let kPosOff = 0

			for (let i = 0; i < notesLength; i++) {
				const note = notes[i]
				const octaveName = octave + octaveCodeOffset
				const noteName = `${notes[i]}${octaveName}`

				const canWhite = isNatural(note)
				const midiCode = midiCodeOffset + i

				if (i > 0) {
					if (canWhite) {
						kPosOff += wOff
						if (isNatural(notes[i - 1])) {
							kPosOff += bOff
						}
					} else {
						kPosOff += bOff
					}
				}

				if (
					!noteInRange(midiCode, {
						octaves,
						octaveCodeOffset,
						startNote,
						endNote,
					})
				)
					continue

				const toPush = {
					key: `key_${noteName}`,
					position: [kPosOff + octave * octaveposOff, 0, 0],
					midiCode: midiCode,
					midiOctave: octaveName,
					noteName: noteName,
					octave: octave,
				}

				if (canWhite) {
					instancesWK.push(toPush)
				} else {
					instancesBK.push(toPush)
				}

				kListeners.push(toPush)
			}
		}

		// console.log(kListeners, instancesWK, instancesBK)

		return [kListeners, instancesWK, instancesBK]
	}, [octaves, octaveCodeOffset, start, end])

	// kwan in english make it look like it booped
	const dummyT = useMemo(() => new THREE.Object3D(), [])
	const updateInstancesAppearance = (ref, ins, c) => {
		if (!ref || !ins || !c) return

		for (let i = 0; i < c; i++) {
			dummyT.position.set(
				ins[i].position[0],
				ins[i].position[1],
				ins[i].position[2]
			)

			dummyT.rotation.set(
				getKeyPressAngle(ins[i].midiCode, ins[i].noteName),
				0,
				0
			)

			dummyT.updateMatrix()
			ref.current.setMatrixAt(i, dummyT.matrix)
		}

		ref.current.instanceMatrix.needsUpdate = true
	}

	useFrame(() => {
		if (theWB.current && instancesWK && theBK.current && instancesBK) {
			updateInstancesAppearance(theWB, instancesWK, countWhite)
			updateInstancesAppearance(theBK, instancesBK, countBlack)
		}
	}, [
		playing,
		playingDemo,
		keebOctave,
	])

	//update music related data
	const updateInstancesMeta = (ref, ins, c) => {
		if (!ref || !ins || !c) return

		ref.current.userData.musicData = []

		for (let i = 0; i < c; i++) {
			ref.current.userData.musicData[i] = {
				midiCode: ins[i].midiCode,
				noteName: ins[i].noteName,
				octave: ins[i].octave,
			}
		}
	}
	useEffect(() => {
		if (theWB.current && instancesWK && theBK.current && instancesBK) {
			updateInstancesMeta(theWB, instancesWK, countWhite)
			updateInstancesMeta(theBK, instancesBK, countBlack)
		}

		// return () => {
		// 	if ( instancesWK && instancesBK) {
		// 		instancesWK.geometry && instancesWK.geometry.dispose()
		// 		instancesBK.material && instancesBK.material.dispose()
		// 	}
		// }
	}, [transpose, theWB, instancesWK, theBK, instancesBK])

	//listeners
	const handleNoteAttack = (e) => {
		e.stopPropagation()

		if (focusOn == 'tactile') {
			const midiCode = getEventMusicData(e).midiCode

			if (!playing.includes(midiCode)) {
				attack(midiCode)
			}
		}
	}

	const handleNoteRelease = (e) => {
		e.stopPropagation()

		if (focusOn == 'tactile') {
			release()
		}
	}

	const handleNoteTouching = (e) => {
		handleCursorPointer(e)
		e.stopPropagation()

		if (focusOn == 'tactile') {
			if (e.pressure > 0) {
				const midiCode = getEventMusicData(e).midiCode
				if (!playing.includes(midiCode) && !isAmbiencing) {
					attack(midiCode)
				}
			}
		}
	}

	const handleNoteLeave = (e) => {
		handleCursorRevert(e)
		e.stopPropagation()

		if (focusOn == 'tactile') {
			if (e.pressure > 0 && !isAmbiencing) {
				release()
			}
		}
	}

	// model shits
	const nodes = getPrimitiveNodes()

	return (
		<>
			<group {...objProps} ref={keysGroup} dispose={null}>
				<group>
					<instancedMesh
						args={[nodes.White.geometry, null, countWhite]}
						instances={instancesWK}
						ref={theWB}
						// castShadow
						receiveShadow={mode !== 'highlight'}
						frustumCulled={false}
					>
						{mode == 'highlight' ? (
							<HighlightMaterial {...materialProps} color={color} />
						) : (
							<SharedMaterial {...materialProps} />
						)}
					</instancedMesh>
					<instancedMesh
						args={[nodes.Black.geometry, null, countBlack]}
						instances={instancesBK}
						ref={theBK}
						receiveShadow={mode !== 'highlight'}
						// castShadow
						frustumCulled={false}
					>
						{mode == 'highlight' ? (
							<HighlightMaterial {...materialProps} color={color} />
						) : (
							<SharedMaterial {...materialProps} />
						)}
					</instancedMesh>
				</group>

				{mode == 'interactive' &&
					kListeners.map((ins, i) => {
						const { key, midiCode, noteName, position } = ins

						return (
							<mesh
								visible={false} // NO U WILL MAKE TIGBAK TO YOUR KOMPYUTER
								ref={kEachAll[i]}
								onPointerMove={handleNoteTouching}
								onPointerLeave={handleNoteLeave}
								onPointerDown={handleNoteAttack}
								onPointerUp={handleNoteRelease}
								key={key}
								increKey={i}
								userData-musicData={{ midiCode, noteName }}
								frustumCulled={false}
								geometry={
									nodes[isNatural(noteName) ? 'White' : 'Black']
										.geometry
								}
								// rotation-x={getKeyPressAngle(midiCode, noteName)}
								position-x={position[0]}
							>
								{/* <SharedMaterial {...materialProps} /> */}
							</mesh>
						)
					})}
			</group>
		</>
	)
}
