import { createAsyncThunk, createSelector, createSlice } from '@reduxjs/toolkit'
import blueprintsService from '../../services/blueprintsService.js'

export const fetchByAuthor = createAsyncThunk(
  'blueprints/fetchByAuthor',
  async (author, { rejectWithValue }) => {
    try {
      const items = await blueprintsService.getByAuthor(author)
      return { author, items: items || [] }
    } catch (err) {
      return rejectWithValue(err.message || 'No se pudieron cargar los planos')
    }
  },
)

export const fetchBlueprint = createAsyncThunk(
  'blueprints/fetchBlueprint',
  async ({ author, name }, { rejectWithValue }) => {
    try {
      return await blueprintsService.getByAuthorAndName(author, name)
    } catch (err) {
      return rejectWithValue(err.message || 'No se pudo cargar el plano')
    }
  },
)

export const createBlueprint = createAsyncThunk(
  'blueprints/createBlueprint',
  async (payload, { rejectWithValue }) => {
    try {
      return await blueprintsService.create(payload)
    } catch (err) {
      return rejectWithValue(err.message || 'No se pudo crear el plano')
    }
  },
)

// Optimistic: aplicamos el cambio en `pending` y lo revertimos en `rejected`
// usando el snapshot que guardamos antes de llamar al servicio.
export const updateBlueprint = createAsyncThunk(
  'blueprints/updateBlueprint',
  async (payload, { getState, rejectWithValue }) => {
    const previous = getState().blueprints.byAuthor[payload.author]?.find(
      (bp) => bp.name === payload.name,
    )
    try {
      return await blueprintsService.update(payload.author, payload.name, payload)
    } catch (err) {
      return rejectWithValue({
        author: payload.author,
        name: payload.name,
        previous,
        message: err.message || 'No se pudo actualizar el plano',
      })
    }
  },
)

export const removeBlueprint = createAsyncThunk(
  'blueprints/removeBlueprint',
  async ({ author, name }, { getState, rejectWithValue }) => {
    const removed = getState().blueprints.byAuthor[author]?.find((bp) => bp.name === name)
    try {
      await blueprintsService.remove(author, name)
      return { author, name }
    } catch (err) {
      return rejectWithValue({
        author,
        name,
        removed,
        message: err.message || 'No se pudo borrar el plano',
      })
    }
  },
)

const slice = createSlice({
  name: 'blueprints',
  initialState: {
    byAuthor: {},
    current: null,
    list: { status: 'idle', error: null },
    detail: { status: 'idle', error: null },
    save: { status: 'idle', error: null },
    remove: { status: 'idle', error: null },
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchByAuthor.pending, (s) => {
        s.list.status = 'loading'
        s.list.error = null
      })
      .addCase(fetchByAuthor.fulfilled, (s, a) => {
        s.list.status = 'succeeded'
        s.byAuthor[a.payload.author] = a.payload.items
      })
      .addCase(fetchByAuthor.rejected, (s, a) => {
        s.list.status = 'failed'
        s.list.error = a.payload || a.error.message
      })

      .addCase(fetchBlueprint.pending, (s) => {
        s.detail.status = 'loading'
        s.detail.error = null
      })
      .addCase(fetchBlueprint.fulfilled, (s, a) => {
        s.detail.status = 'succeeded'
        s.current = a.payload
      })
      .addCase(fetchBlueprint.rejected, (s, a) => {
        s.detail.status = 'failed'
        s.detail.error = a.payload || a.error.message
      })

      .addCase(createBlueprint.pending, (s) => {
        s.save.status = 'loading'
        s.save.error = null
      })
      .addCase(createBlueprint.fulfilled, (s, a) => {
        s.save.status = 'succeeded'
        const bp = a.payload
        if (!s.byAuthor[bp.author]) s.byAuthor[bp.author] = []
        s.byAuthor[bp.author].push(bp)
      })
      .addCase(createBlueprint.rejected, (s, a) => {
        s.save.status = 'failed'
        s.save.error = a.payload || a.error.message
      })

      .addCase(updateBlueprint.pending, (s, a) => {
        s.save.status = 'loading'
        s.save.error = null
        const payload = a.meta.arg
        const list = s.byAuthor[payload.author]
        if (list) {
          const idx = list.findIndex((bp) => bp.name === payload.name)
          if (idx !== -1) list[idx] = { ...list[idx], ...payload }
        }
        if (s.current?.author === payload.author && s.current?.name === payload.name) {
          s.current = { ...s.current, ...payload }
        }
      })
      .addCase(updateBlueprint.fulfilled, (s, a) => {
        s.save.status = 'succeeded'
        const bp = a.payload
        const list = s.byAuthor[bp.author]
        if (list) {
          const idx = list.findIndex((item) => item.name === bp.name)
          if (idx !== -1) list[idx] = bp
        }
        if (s.current?.author === bp.author && s.current?.name === bp.name) {
          s.current = bp
        }
      })
      .addCase(updateBlueprint.rejected, (s, a) => {
        s.save.status = 'failed'
        const info = a.payload
        s.save.error = info?.message || a.error.message
        if (info?.previous) {
          const list = s.byAuthor[info.author]
          if (list) {
            const idx = list.findIndex((bp) => bp.name === info.name)
            if (idx !== -1) list[idx] = info.previous
          }
          if (s.current?.author === info.author && s.current?.name === info.name) {
            s.current = info.previous
          }
        }
      })

      .addCase(removeBlueprint.pending, (s, a) => {
        s.remove.status = 'loading'
        s.remove.error = null
        const { author, name } = a.meta.arg
        const list = s.byAuthor[author]
        if (list) {
          s.byAuthor[author] = list.filter((bp) => bp.name !== name)
        }
      })
      .addCase(removeBlueprint.fulfilled, (s) => {
        s.remove.status = 'succeeded'
      })
      .addCase(removeBlueprint.rejected, (s, a) => {
        s.remove.status = 'failed'
        const info = a.payload
        s.remove.error = info?.message || a.error.message
        if (info?.removed) {
          if (!s.byAuthor[info.author]) s.byAuthor[info.author] = []
          s.byAuthor[info.author].push(info.removed)
        }
      })
  },
})

const selectByAuthor = (state) => state.blueprints.byAuthor

// Memo selector: top-5 blueprints (de todos los autores ya consultados) por
// cantidad de puntos, de mayor a menor.
export const selectTopBlueprints = createSelector([selectByAuthor], (byAuthor) =>
  Object.values(byAuthor)
    .flat()
    .slice()
    .sort((a, b) => (b.points?.length || 0) - (a.points?.length || 0))
    .slice(0, 5),
)

export default slice.reducer
