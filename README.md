# ☣ Apocalypse Bunker Queue ☣

**Survive if you can…**

---

## Live Demo
Test your survival skills here: [https://bunker-five.vercel.app/](https://bunker-five.vercel.app/)

---

## What is this?

The apocalypse is here. Zombies, aliens, or radioactive fallout—take your pick.  
You have **ONE shot** to get into the bunker.  

This is a **fun, thrilling simulation** where classmates compete to survive based on **priority**, not speed. First-come, first-served is dead.  

### Features

- Student login and admin login  
- Enter the queue to save yourself (if you’re lucky)  
- Priority-based survival  
- Admin can set bunker capacity and process the queue  
- As always we believe in BARF: Bugs: A Replaced Feature  

---

## How it Works

1. **Login as a student**  
2. Click **“Enter the Queue to Save Yourself”**  
3. Wait… then check your **status**:     
   ✅ Congrats, you got in!    
   ❌ Bye! Enjoy eating brains!    

4. Admins get extra powers:  

- Set **bunker capacity**  
- Process the queue  
- See who survived and who didn’t
---

## Tech Stack

- **Frontend**: Next.js 14+ (React)  
- **Backend**: FastAPI  
- **Database**: MySQL (hosted on Railway)  
- **Hosting**: Vercel (frontend), Railway (backend)  

---

## Installation (for brave coders)

```bash
# Clone repo
git clone https://github.com/sammy-ryed/Bunker.git
cd Bunker

# Backend
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload

# Frontend
cd ../frontend
npm install
npm run dev
```
## Environment Variables

- Backend .env:
```
DATABASE_URL=mysql+pymysql://<user>:<password>@<host>:<port>/<db>
JWT_SECRET=<your_super_secret_key>
FRONTEND_URL=http://localhost:3000
```

- Frontend .env:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

(Switch to production URLs when deploying)

---
## Contribution

Think you can survive better?    
PRs welcome for improvements in:   

- Queue logic

- UI/UX

- Zombie animations
- Starting the apocalypse so this website takes off 🥹
---
## Hall of Survivors

Make your mark! Every accepted student is immortalized in the database…    
Will your name appear in the final survivor list? Only the queue knows.  

---
## Warning

This is only a simulation. No real apocalypse survivors were harmed.
