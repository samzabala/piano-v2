/* 
Midi Bois arranged by me. Do not Touch
*/
import * as TeenTitans from './midi/teentitans.json'
import * as AttackOnTitan from './midi/attackontitan.json'
import * as GravityFalls from './midi/gravityfalls.json'
import * as LoveMeHarder from './midi/lovemeharder.json'
import * as TwoOneFour from './midi/214.json'
import * as SorryNaPwedeBa from './midi/sorrynapwedeba.json'
import * as ItsOverIsntIt from './midi/itsoverisntit.json'

// the bbs
export const demoProps = [
	
	// tests polyphony + midi controller changes, chaddiest midi events
	{
		name: 'Teen Titans Theme Song',
		tag: 'TT',
		midi: TeenTitans,
	},
	
	// tests chaddiest midi controller changes
	{
		name: 'This Beautiful Cruel World',
		tag: 'AOT',
		midi: AttackOnTitan,
	},

	// nothing just wanted to flex how multitalented i am
	{
		name: 'Gravity Falls Theme Song',
		tag: 'GF',
		midi: GravityFalls,
	},

	// nothing just wanted to flex how multitalented i am
	{
		name: 'Love Me Harder',
		tag: 'LMH',
		midi: LoveMeHarder,
	},

	// test envelope / raw recording excpt its not i already cleaned it up
	{
		name: '214',
		tag: '214',
		midi: TwoOneFour,
	},

	// nothing just wanted to flex how multitalented i am
	{
		name: 'Sorry na Pwede Ba?',
		tag: 'SPB',
		midi: SorryNaPwedeBa,
	},

	// test freeform / bpm changes
	{
		name: "It's Over Isn't It?",
		tag: 'SU',
		midi: ItsOverIsntIt,
	},
]

// all the bois are exported thru logic so imma keep it consistent on mount so the whole bitch doesnt die yeeeaa
export const demoPPQ = 480
