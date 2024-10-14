import fs from 'fs/promises'
import path from 'path'

const LIST_FILE = path.join(process.cwd(), 'data', 'list.json')

export class List {
  private list: any = []

  constructor() {}

  async init() {
    await this.ensureFile()
    await this.loadList()
  }

  private async ensureFile() {
    try {
      await fs.access(LIST_FILE)
    } catch (error) {
      await fs.mkdir(path.dirname(LIST_FILE), { recursive: true })
      await fs.writeFile(LIST_FILE, '[]')
    }
  }

  private async loadList() {
    const data = await fs.readFile(LIST_FILE, 'utf8')
    this.list = JSON.parse(data)
  }

  private async saveList() {
    await fs.writeFile(LIST_FILE, JSON.stringify(this.list, null, 2))
  }

  async getList(key: string, value: any) {
    try {
      await this.loadList()

      if (key) {
        return this.list.filter((item: any) => item[key] === value)
      } else {
        return this.list
      }
    } catch (error) {
      return []
    }
  }

  async getItemById(id: number) {
    await this.loadList()

    const item = this.list.find((item: any) => item.id === id)
    return item || null
  }

  async createItem(item: any) {
    await this.loadList()

    const newItem = {
      id: Date.now() % 100000,
      ...item,
    }

    this.list.push(newItem)
    await this.saveList()
    return newItem
  }

  async updateItem(key: any, value: any, updates: any) {
    await this.loadList()

    const itemIndex = this.list.findIndex((item: any) => item[key] === value)
    if (itemIndex === -1) return null

    this.list[itemIndex] = { ...this.list[itemIndex], ...updates }
    await this.saveList()

    return this.list[itemIndex]
  }

  async deleteItem(id: number) {
    await this.loadList()

    const initialLength = this.list.length

    this.list = this.list.filter((item: any) => item.id !== id)
    if (this.list.length !== initialLength) {
      await this.saveList()
      return true
    }
    return false
  }
}

let listInstance: any = null

export async function getInstance() {
  if (!listInstance) {
    listInstance = new List()
  }

  await listInstance.init()

  return listInstance
}
