# E-commerce Backend

## 🛠 Tech
Node.js + Express + Prisma + PostgreSQL

## Setup
npm install
cp .env.example .env
npx prisma migrate dev
npm run dev

## Workflow
git checkout -b feature/auth

# prisma
Tạo ra một thư mục mới tên là prisma/ ở gốc dự án, bên trong có file schema.prisma. Đây là nơi quản lý Database

## set up prisma
`npm install prisma --save-dev` : cài thư viện
`npx prisma init` : khởi tạo prisma