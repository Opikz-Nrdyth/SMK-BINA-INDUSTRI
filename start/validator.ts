import vine, { SimpleMessagesProvider } from '@vinejs/vine'

const messages = {
  required: 'Kolom {{ field }} wajib diisi.',
  string: 'Kolom {{ field }} harus berupa teks.',
  number: 'Kolom {{ field }} harus berupa angka.',
  boolean: 'Kolom {{ field }} harus berupa nilai benar atau salah.',
  email: 'Format email pada kolom {{ field }} tidak valid.',
  minLength: 'Kolom {{ field }} minimal memiliki {{ min }} karakter.',
  maxLength: 'Kolom {{ field }} maksimal memiliki {{ max }} karakter.',
  enum: 'Kolom {{ field }} tidak valid, pilih salah satu nilai yang benar.',
  date: 'Kolom {{ field }} harus berupa tanggal yang valid.',
  confirmed: 'Konfirmasi untuk {{ field }} tidak cocok.',
  unique: 'Nilai pada kolom {{ field }} sudah terdaftar.',
  alpha: 'Kolom {{ field }} hanya boleh berisi huruf.',
  alphaNumeric: 'Kolom {{ field }} hanya boleh berisi huruf dan angka.',
  array: 'Kolom {{ field }} harus berupa daftar data.',
  object: 'Kolom {{ field }} harus berupa objek.',
  url: 'Kolom {{ field }} harus berupa tautan (URL) yang valid.',
  regex: 'Format kolom {{ field }} tidak sesuai.',
  nullable: 'Kolom {{ field }} boleh dikosongkan.',
  max: 'Nilai pada kolom {{ field }} tidak boleh lebih dari {{ max }}.',
  min: 'Nilai pada kolom {{ field }} minimal {{ min }}.',
  same: 'Kolom {{ field }} harus sama dengan kolom {{ other }}.',
  different: 'Kolom {{ field }} harus berbeda dengan kolom {{ other }}.',
  after: 'Kolom {{ field }} harus setelah tanggal {{ other }}.',
  before: 'Kolom {{ field }} harus sebelum tanggal {{ other }}.',
}

vine.messagesProvider = new SimpleMessagesProvider(messages)
