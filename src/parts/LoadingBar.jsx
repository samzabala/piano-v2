/*
Bar: Overture Escape from Planet Sago by Radioactive Sago Project
*/
import './../scss/_LoadingBar.scss'

export default function LoadingBar({
	text,
	hide,
	width = 0,
	buttonText,
	showButton,
	onClick,
}) {
	return (
		<>
			{/* { !hide ?  */}
			<div
				id='loading'
				className={`overlay ${hide ? 'overlay-disabled' : ''}`}
				style={{
					'--progress': width,
				}}
			>
				<div className='overlay-contents'>
					<div className='loading-bar'></div>

					{showButton && buttonText ? (
						<button onClick={onClick} className='button '>
							{buttonText}
						</button>
					) : (
						<span className='button button-blend-in'>{text}</span>
					)}
				</div>
			</div>
			{/* // : null } */}
		</>
	)
}
