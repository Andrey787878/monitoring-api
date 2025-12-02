import { render, screen, fireEvent } from '@testing-library/react'
import App from './App'

beforeEach(() => {
	global.fetch = vi.fn(() =>
		Promise.resolve({
			ok: true,
			json: () => Promise.resolve({ status: 'healthy' }),
		})
	)
})

afterEach(() => {
	vi.resetAllMocks()
})

test('рендерит кнопки для эндпоинтов', () => {
	render(<App />)

	expect(screen.getByText('/health')).toBeInTheDocument()
	expect(screen.getByText('/ready')).toBeInTheDocument()
	expect(screen.getByText('/metrics')).toBeInTheDocument()
})

test('по клику на /health дергает API', () => {
	render(<App />)

	const btn = screen.getByText('/health')

	fireEvent.click(btn)

	expect(global.fetch).toHaveBeenCalledWith('/health')
})
