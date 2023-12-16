import { useRef, useMemo, useEffect } from 'react'
import usePlay from './../stores/usePlay.jsx'
export default function () {
	const setMobile = usePlay((state) => state.setMobile)

	const media = useRef()

	useMemo(() => {
		media.current = matchMedia(`(min-width: 768px), (pointer: fine)`)
		setMobile(!media.current.matches)
	}, [])

	useEffect(() => {
		const unsubscribeChange = () => {
			setMobile(!media.current.matches)
		}
		media.current.addEventListener('change', unsubscribeChange)
		return () => {
			media.current.removeEventListener('change', unsubscribeChange)
		}
	}, [media.current])

	return
}
