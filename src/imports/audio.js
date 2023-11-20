import { useState } from 'react'

import Grand from './sounds/grand'
import NotAPiano from './sounds/notapiano'
import LuhMiMumu from './sounds/luhmimumu'
import Mochi from './sounds/mochi'
import Tick from './sounds/Tick'

export const voicesProps = [
	{
		name: 'Grand Piano',
		args: {
			urls: Grand,
		},
	},
	{
		name: 'Not A Piano',
		args: {
			urls: NotAPiano,
		},
	},
	{
		name: 'Luh mi Mumu',
		args: {
			urls: LuhMiMumu,
		},
	},
	{
		name: 'Raging Mochi',
		args: {
			urls: Mochi,
		},
	},
]

export const Metronome = Tick
