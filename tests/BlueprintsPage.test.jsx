import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { configureStore, createSlice, createSelector } from '@reduxjs/toolkit'
import BlueprintsPage from '../src/pages/BlueprintsPage.jsx'

// Mock de thunks/selectores del slice para no requerir backend
vi.mock('../src/features/blueprints/blueprintsSlice.js', () => ({
  fetchByAuthor: (author) => ({ type: 'blueprints/fetchByAuthor', payload: author }),
  fetchBlueprint: (payload) => ({ type: 'blueprints/fetchBlueprint', payload }),
  removeBlueprint: (payload) => ({ type: 'blueprints/removeBlueprint', payload }),
  selectTopBlueprints: createSelector(
    (state) => state.blueprints.byAuthor,
    (byAuthor) => Object.values(byAuthor).flat(),
  ),
}))

function makeStore(preloaded) {
  const slice = createSlice({
    name: 'blueprints',
    initialState: {
      byAuthor: {},
      current: null,
      list: { status: 'idle', error: null },
      detail: { status: 'idle', error: null },
      save: { status: 'idle', error: null },
      remove: { status: 'idle', error: null },
      ...preloaded,
    },
    reducers: {},
  })
  return configureStore({ reducer: { blueprints: slice.reducer } })
}

describe('BlueprintsPage', () => {
  it('despacha fetchByAuthor al hacer click en Get blueprints', () => {
    const store = makeStore()
    const spy = vi.spyOn(store, 'dispatch')
    render(
      <Provider store={store}>
        <MemoryRouter>
          <BlueprintsPage />
        </MemoryRouter>
      </Provider>,
    )

    fireEvent.change(screen.getByPlaceholderText(/Author/i), { target: { value: 'JohnConnor' } })
    fireEvent.click(screen.getByText(/Get blueprints/i))

    expect(spy).toHaveBeenCalledWith({ type: 'blueprints/fetchByAuthor', payload: 'JohnConnor' })
  })
})
