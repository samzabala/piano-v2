/*
Keys: Hayup nihaw oh also it visualizes how u do and what the boopies... words
*/
import * as THREE from 'three'
import React, { useRef, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'

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
import { SharedMaterial } from './../imports/materials.jsx'

export default function Model({
	octaves = 1,
	octaveCodeOffset = 0,
	startNote = 'C',
	endNote = 'B',
	objProps,
	materialProps,
	listen = true,
}) {
	//states n helpers
	const transpose = usePlay((state) => state.transpose)

	const focusOn = usePlay((state) => state.focusOn)

	const keebOctave = usePlay((state) => state.keebOctave)
	const hasKeebsMap = usePlay((state) => state.hasKeebsMap)

	const isDemoing = usePlay((state) => state.isDemoing)
	const playingDemo = usePlay((state) => state.playingDemo)

	const isAmbiencing = usePlay((state) => state.isAmbiencing)

	const playing = usePlay((state) => state.playing)
	const attack = usePlay((state) => state.attack)
	const release = usePlay((state) => state.release)

	const getEventMusicData = (e) => {
		return e.object.userData.musicData
	}

	const getKeyPressAngle = (midiCode, noteName, velocity = 1) => {
		return playing.filter(([m]) => m == midiCode).length ||
			playingDemo.filter(([m]) => m == midiCode).length
			? isNatural(noteName)
				? Math.PI * -0.028 * velocity
				: Math.PI * -0.016 * velocity
			: 0
	}
	const wOff = 0
	const bOff = -0.32
	const octaveposOff = -2.24

	const start = notes.indexOf(startNote)
	const end = notes.indexOf(endNote)
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
	}, [])

	const keysGroup = useRef() //si grupo kang component mismo
	const kEachAll = Array(count).fill(useRef()) // gabos
	const kInsW = useRef() // i have to separate because three js be low key racist
	const kInsB = useRef() // ooo waw

	const [kListeners, instancesKFarW, instancesKFarB] = useMemo(() => {
		const kListeners = []
		const instancesKFarW = []
		const instancesKFarB = []

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
					instancesKFarW.push(toPush)
				} else {
					instancesKFarB.push(toPush)
				}

				kListeners.push(toPush)
			}
		}

		return [kListeners, instancesKFarW, instancesKFarB]
	}, [])

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
				getKeyPressAngle(ins[i].midiCode, ins[i].noteName), //todo press angle multiply by velocity
				0,
				0
			)

			dummyT.updateMatrix()
			ref.current.setMatrixAt(i, dummyT.matrix)
		}

		ref.current.instanceMatrix.needsUpdate = true
	}

	useFrame(() => {
		
		if (kInsW.current && instancesKFarW && kInsB.current && instancesKFarB) {
			updateInstancesAppearance(kInsW, instancesKFarW, countWhite)
			updateInstancesAppearance(kInsB, instancesKFarB, countBlack)
		}
	}, [
		playing,
		playingDemo,
		keebOctave,
		// hasKeebsMap // todo maybe
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
		if (kInsW.current && instancesKFarW && kInsB.current && instancesKFarB) {
			updateInstancesMeta(kInsW, instancesKFarW, countWhite)
			updateInstancesMeta(kInsB, instancesKFarB, countBlack)
		}
	}, [transpose, kInsW, instancesKFarW, kInsB, instancesKFarB])

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
				<instancedMesh
					args={[nodes.White.geometry, null, countWhite]}
					instances={instancesKFarW}
					ref={kInsW}
					// castShadow
					receiveShadow
					frustumCulled={false}
				>
					<SharedMaterial {...materialProps} />
				</instancedMesh>
				<instancedMesh
					args={[nodes.Black.geometry, null, countBlack]}
					instances={instancesKFarB}
					ref={kInsB}
					receiveShadow
					// castShadow
					frustumCulled={false}
				>
					<SharedMaterial {...materialProps} />
				</instancedMesh>

				{listen &&
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
								<SharedMaterial {...materialProps} />
							</mesh>
						)
					})}
			</group>
		</>
	)
}
