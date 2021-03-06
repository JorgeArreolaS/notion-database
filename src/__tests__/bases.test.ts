import { NotionDatabase } from '../index'
import { User, Pet, Toy } from './types'

describe('Parser bases tests', () => {
  require('dotenv').config()

  const token = process.env.DEV_NOTION_TOKEN
  if (!token) return

  const notion = new NotionDatabase(token)

  const toys_db = notion.database<Toy>('288fdf4d7dae4ef6ab784d577802cb0b', {
    id: '',
    name: '',
    pets: [],
  })
  const pets_db = notion.database<Pet>('4786bb9c1f254f1e9fa2831d67672c9c', {
    id: '',
    name: '',
    colors: [],
    users: [],
    toys: toys_db,
  })

  const users_db = notion.database<User>('1104dd21183a458fb71d5c1110f0bbfc', {
    id: '',
    emoji: '',
    name: '',
    hobby: null,
    pets: pets_db,
  })

  test('Manual base', async () => {
    const pets = await pets_db.get()

    const users = await users_db.get({
      bases: {
        pets: pets,
      },
    })

    const liz = users.find((user) => user.name === 'liz')
    if (!liz) throw Error('"Liz" user not found')
    expect(pets).toContainEqual(liz.pets[0])
    expect(pets).toContainEqual(liz.pets[1])
    const tom = pets.find((pet) => pet.name === 'tom')
    if (!tom) throw Error('"Tom" pet not found')
    expect(liz.pets).not.toContain(tom)
  })

  test('Database as base', async () => {
    const users = await users_db.get()

    // console.log(users)
    // console.log(util.inspect(users, false, null, true /* enable colors */))

    const pets = await pets_db.get()
    const liz = users.find((user) => user.name === 'liz')
    if (!liz) throw Error('"Liz" user not found')
    expect(pets).toContainEqual(liz.pets[0])
    expect(pets).toContainEqual(liz.pets[1])

    const tom = pets.find((pet) => pet.name === 'tom')
    if (!tom) throw Error('"Tom" pet not found')
    expect(liz.pets).not.toContain(tom)
  })
})
