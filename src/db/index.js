import Dexie from 'dexie'

export const db = new Dexie('TrainApp')

db.version(1).stores({
  bodyLogs: '++id, date',
  workouts: '++id, date',
  exercises: '++id, name',
})

export async function seedExercises() {
  const count = await db.exercises.count()
  if (count > 0) return
  await db.exercises.bulkAdd([
    { name: 'Жим лёжа', category: 'Грудь' },
    { name: 'Жим гантелей', category: 'Грудь' },
    { name: 'Разводка гантелей', category: 'Грудь' },
    { name: 'Кроссовер', category: 'Грудь' },
    { name: 'Отжимания', category: 'Грудь' },
    { name: 'Подтягивания', category: 'Спина' },
    { name: 'Тяга штанги', category: 'Спина' },
    { name: 'Тяга гантели', category: 'Спина' },
    { name: 'Тяга блока', category: 'Спина' },
    { name: 'Гиперэкстензия', category: 'Спина' },
    { name: 'Приседания', category: 'Ноги' },
    { name: 'Жим ногами', category: 'Ноги' },
    { name: 'Румынская тяга', category: 'Ноги' },
    { name: 'Выпады', category: 'Ноги' },
    { name: 'Разгибание ног', category: 'Ноги' },
    { name: 'Сгибание ног', category: 'Ноги' },
    { name: 'Жим штанги стоя', category: 'Плечи' },
    { name: 'Жим гантелей сидя', category: 'Плечи' },
    { name: 'Махи в стороны', category: 'Плечи' },
    { name: 'Тяга к подбородку', category: 'Плечи' },
    { name: 'Подъём на бицепс', category: 'Бицепс' },
    { name: 'Молотки', category: 'Бицепс' },
    { name: 'Концентрированный подъём', category: 'Бицепс' },
    { name: 'Разгибание на трицепс', category: 'Трицепс' },
    { name: 'Французский жим', category: 'Трицепс' },
    { name: 'Отжимания на брусьях', category: 'Трицепс' },
    { name: 'Планка', category: 'Пресс' },
    { name: 'Скручивания', category: 'Пресс' },
    { name: 'Подъём ног', category: 'Пресс' },
    { name: 'Становая тяга', category: 'Комплекс' },
  ])
}
