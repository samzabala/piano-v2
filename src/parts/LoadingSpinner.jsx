/*
Spinner: ikot ikot lang by Sarah G
*/
import usePlay from '../stores/usePlay'

export default function LoadingSpinner({ text, hide }) {
	//states n shit
	const focusOn = usePlay((state) => state.focusOn)
	const setFocus = usePlay((state) => state.setFocus)

	return (
		<>
			{!hide ? (
				<div
					className={`overlay overlay-opaque ${
						hide ? 'overlay-disabled' : ''
					}`}
					onClick={() => {
						focusOn !== '' && setFocus('')
					}}
				>
					<div className='overlay-contents'>
						<div className='loading-spinner'>
							<svg
								version={'1.1'}
								xmlns={'http://www.w3.org/2000/svg'}
								xmlnsXlink={'http://www.w3.org/1999/xlink'}
								x={'0px'}
								y={'0px'}
								width={'104px'}
								height={'104px'}
								viewBox={'0 0 104 104'}
								enableBackground={'new 0 0 104 104'}
								xmlSpace={'preserve'}
							>
								<path
									fill={'none'}
									stroke={'currentColor'}
									strokeWidth={4}
									strokeLinecap={'round'}
									strokeLinejoin={'round'}
									strokeDasharray={[160]}
									d={
										'M52,2L52,2c27.6,0,50,22.4,50,50l0,0c0,27.6-22.4,50-50,50l0,0C24.4,102,2,79.6,2,52l0,0C2,24.4,24.4,2,52,2z'
									}
								>
									<animateTransform
										attributeType='xml'
										attributeName='transform'
										type='rotate'
										from='360 52 52'
										to='0 52 52'
										dur={'1s'}
										repeatCount={'indefinite'}
									/>
									<animate
										attributeName={'stroke-dasharray'}
										values={'80,0,0 ; 0,80,0; 0,0,80 '}
										keyTimes={'0; 0.5; 1'}
										from={'80,0'}
										to={'80,0'}
										fill={'freeze'}
										dur={'2s'}
										repeatCount={'indefinite'}
									></animate>

									<animate
										attributeName={'stroke-dashoffset'}
										values={'160; 0; -160 '}
										keyTimes={'0; 0.5; 1'}
										from={'160'}
										to={'320'}
										fill={'freeze'}
										dur={'2s'}
										repeatCount={'indefinite'}
									></animate>
								</path>
							</svg>
						</div>
						<p>{text}</p>
					</div>
				</div>
			) : null}
		</>
	)
}
