import Grand from './audio/Grand'
import NotAPiano from './audio/NotAPiano'
import LuhMiMumu from './audio/LuhMiMumu'
import Mochi from './audio/Mochi'
import Tick from './audio/Tick'

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
