
import os
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, Header, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from sqlmodel import SQLModel, Field, Relationship, create_engine, Session, select
from sqlalchemy import func

#Models 
class Profile(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    email: str
    education: Optional[str] = None
    github: Optional[str] = None
    linkedin: Optional[str] = None
    portfolio: Optional[str] = None

class ProjectSkillLink(SQLModel, table=True):
    project_id: int = Field(foreign_key="project.id", primary_key=True)
    skill_id: int = Field(foreign_key="skill.id", primary_key=True)

class Project(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    description: str
    link: Optional[str] = None
    skills: List["Skill"] = Relationship(back_populates="projects", link_model=ProjectSkillLink)

class Skill(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True, unique=True)
    projects: List[Project] = Relationship(back_populates="skills", link_model=ProjectSkillLink)

class WorkExperience(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    company: str
    role: str
    start_date: str
    end_date: Optional[str] = None
    description: Optional[str] = None
#Response Schemas 
class ProjectOut(BaseModel):
    id: int
    title: str
    description: str
    link: Optional[str] = None
    skills: List[str] = []

class SkillOut(BaseModel):
    name: str
    count: int

#App & DB 
API_KEY = os.getenv("API_KEY", "changeme")
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///me.db")

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
)

app = FastAPI(title="Me-API Playground", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_session():
    with Session(engine) as session:
        yield session

def auth_guard(x_api_key: Optional[str] = Header(None)):
    if API_KEY and x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid or missing X-API-Key")

#Utility 
def to_project_out(p: Project) -> ProjectOut:
    return ProjectOut(
        id=p.id,
        title=p.title,
        description=p.description,
        link=p.link,
        skills=[s.name for s in p.skills]
    )

def maybe_seed():
    with Session(engine) as session:
        has_profile = session.exec(select(Profile)).first()
        if has_profile:
            return

        #Profile
        profile = Profile(
            name="Dhruv Bareja",
            email="dhruvbareja17@gmail.com",
            education="B.Tech in Information Technology — Manipal University Jaipur (GPA: 8.71/10.0)",
            github="https://github.com/dhruvbareja",
            linkedin="https://www.linkedin.com/in/dhruv-bareja-a3071516b/",
            portfolio=None  # add if you have a personal portfolio link
        )
        session.add(profile)

        #Skills
        skill_names = [
            "Python", "Java", "JavaScript", "HTML", "CSS", "SQL", "Azure",
            "ReactJS", "PyTorch", "Scikit-learn", "Pandas", "Transformers",
            "Git", "GitHub", "Google Colab", "Next.js", "PHP", "Swift", "SwiftUI"
        ]
        skills = [Skill(name=n) for n in skill_names]
        session.add_all(skills)
        session.flush()

        def s(name):
            return session.exec(select(Skill).where(Skill.name == name)).one()
#projects
        p1 = Project(
            title="Fake News Detection with ABSA",
            description="Published at ICCCNT 2025. Developed an AI-powered system for detecting deceptive reviews using deep learning, graph refinement, and transformers.",
            link=""
        )
        p1.skills = [s("Python"), s("PyTorch"), s("Transformers"), s("Scikit-learn"), s("Pandas")]

        p2 = Project(
            title="Hotel Management Website",
            description="Developed a full-stack website enabling secure login and room booking with database integration.",
            link=""
        )
        p2.skills = [s("HTML"), s("CSS"), s("JavaScript"), s("Next.js"), s("PHP"), s("SQL")]

        p3 = Project(
            title="Weather-Travel App using SwiftUI",
            description="Created an iOS app that integrates real-time weather data and tourist spot recommendations using OpenWeather API and Google Places API.",
            link=""
        )
        p3.skills = [s("Swift"), s("SwiftUI")]

        session.add_all([p1, p2, p3])

        #Work Experience 
        w1 = WorkExperience(
            company="Velocity Software Solutions Pvt. Ltd.",
            role="Backend Development Intern",
            start_date="2024-05",
            end_date="2024-07",
            description="Developed RFP management backend with role-based access control, notifications, and dashboards. Worked with MongoDB, Node.js, Django, and SQL."
        )
        session.add(w1)

        session.commit()

#Create tables
SQLModel.metadata.create_all(engine)
maybe_seed()

#Routes 
@app.get("/api/health")
def health():
    return {"status": "ok"}

# Profile
@app.get("/api/profile", response_model=Profile)
def get_profile(session: Session = Depends(get_session)):
    profile = session.exec(select(Profile)).first()
    if not profile:
        raise HTTPException(404, "Profile not found")
    return profile

@app.put("/api/profile", dependencies=[Depends(auth_guard)], response_model=Profile)
def upsert_profile(payload: Profile, session: Session = Depends(get_session)):
    profile = session.exec(select(Profile)).first()
    if profile:
        for k, v in payload.dict(exclude_unset=True).items():
            setattr(profile, k, v)
        session.add(profile)
    else:
        session.add(payload)
    session.commit()
    return session.exec(select(Profile)).first()

# Skills
@app.get("/api/skills", response_model=List[str])
def list_skills(session: Session = Depends(get_session)):
    rows = session.exec(select(Skill).order_by(Skill.name)).all()
    return [r.name for r in rows]

@app.get("/api/skills/top", response_model=List[SkillOut])
def top_skills(limit: int = Query(10, ge=1, le=50), session: Session = Depends(get_session)):
    stmt = (
        select(Skill.name, func.count(ProjectSkillLink.project_id).label("count"))
        .join(ProjectSkillLink, Skill.id == ProjectSkillLink.skill_id, isouter=True)
        .group_by(Skill.name)
        .order_by(func.count(ProjectSkillLink.project_id).desc(), Skill.name.asc())
        .limit(limit)
    )
    rows = session.exec(stmt).all()
    return [SkillOut(name=r[0], count=r[1] or 0) for r in rows]

# Projects
@app.get("/api/projects", response_model=List[ProjectOut])
def list_projects(skill: Optional[str] = None, session: Session = Depends(get_session)):
    if skill:
        stmt = (
            select(Project)
            .join(ProjectSkillLink, Project.id == ProjectSkillLink.project_id)
            .join(Skill, Skill.id == ProjectSkillLink.skill_id)
            .where(Skill.name.ilike(skill))
            .order_by(Project.title)
        )
    else:
        stmt = select(Project).order_by(Project.title)
    projects = session.exec(stmt).unique().all()

    for p in projects:
        _ = p.skills  
    return [to_project_out(p) for p in projects]

@app.get("/api/projects/{project_id}", response_model=ProjectOut)
def get_project(project_id: int, session: Session = Depends(get_session)):
    project = session.get(Project, project_id)
    if not project:
        raise HTTPException(404, "Project not found")
    _ = project.skills
    return to_project_out(project)

class ProjectIn(BaseModel):
    title: str
    description: str
    link: Optional[str] = None
    skills: List[str] = []

@app.post("/api/projects", dependencies=[Depends(auth_guard)], response_model=ProjectOut, status_code=201)
def create_project(payload: ProjectIn, session: Session = Depends(get_session)):
    project = Project(title=payload.title, description=payload.description, link=payload.link)

    skills = []
    for name in payload.skills:
        sk = session.exec(select(Skill).where(Skill.name == name)).first()
        if not sk:
            sk = Skill(name=name)
            session.add(sk)
            session.flush()
        skills.append(sk)
    project.skills = skills
    session.add(project)
    session.commit()
    session.refresh(project)
    _ = project.skills
    return to_project_out(project)

@app.put("/api/projects/{project_id}", dependencies=[Depends(auth_guard)], response_model=ProjectOut)
def update_project(project_id: int, payload: ProjectIn, session: Session = Depends(get_session)):
    project = session.get(Project, project_id)
    if not project:
        raise HTTPException(404, "Project not found")
    project.title = payload.title
    project.description = payload.description
    project.link = payload.link

    new_skills = []
    for name in payload.skills:
        sk = session.exec(select(Skill).where(Skill.name == name)).first()
        if not sk:
            sk = Skill(name=name)
            session.add(sk)
            session.flush()
        new_skills.append(sk)
    project.skills = new_skills
    session.add(project)
    session.commit()
    session.refresh(project)
    _ = project.skills
    return to_project_out(project)

@app.delete("/api/projects/{project_id}", dependencies=[Depends(auth_guard)], status_code=204)
def delete_project(project_id: int, session: Session = Depends(get_session)):
    project = session.get(Project, project_id)
    if not project:
        raise HTTPException(404, "Project not found")
    session.delete(project)
    session.commit()
    return

#Work
@app.get("/api/work")
def list_work(session: Session = Depends(get_session)):
    rows = session.exec(select(WorkExperience).order_by(WorkExperience.start_date.desc())).all()
    return rows

#Search
@app.get("/api/search")
def search(q: str, session: Session = Depends(get_session)):
    projects = session.exec(
        select(Project)
        .where(
            (Project.title.ilike(f"%{q}%")) | (Project.description.ilike(f"%{q}%"))
        )
        .order_by(Project.title)
    ).unique().all()
    for p in projects:
        _ = p.skills
    skills = session.exec(select(Skill).where(Skill.name.ilike(f"%{q}%"))).all()
    return {
        "projects": [to_project_out(p).dict() for p in projects],
        "skills": [s.name for s in skills]
    }

#Static frontend
static_dir = os.path.join(os.path.dirname(__file__), "..", "frontend")
if os.path.isdir(static_dir):
    app.mount("/", StaticFiles(directory=static_dir, html=True), name="frontend")
