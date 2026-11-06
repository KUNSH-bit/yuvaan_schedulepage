
"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import styles from "./race-schedule.module.css";

const RaceTrackScene = dynamic(
  () => import("@/components/race-schedule/RaceTrackScene"),
  {
    ssr: false,
    loading: () => (
      <div className={styles.loading}>
        PREPARING THE CIRCUIT...
      </div>
    ),
  }
);

type Event = {
  id: number;
  title: string;
  time: string;
  venue: string;
  category: string;
  description: string;
};

const schedule: Record<number, Event[]> = {
  1: [
    {
      id: 1,
      title: "Grand Inauguration",
      time: "09:00 AM",
      venue: "Main Auditorium",
      category: "Ceremony",
      description: "Kick off the festival with the opening ceremony.",
    },
    {
      id: 2,
      title: "HackQuest Begins",
      time: "10:30 AM",
      venue: "Innovation Hub",
      category: "Technology",
      description: "The coding challenge officially starts.",
    },
    {
      id: 3,
      title: "Cosplay Registration",
      time: "12:00 PM",
      venue: "Registration Arena",
      category: "Comic Con",
      description: "Check in for the cosplay competition.",
    },
    {
      id: 4,
      title: "Battle of the Bands",
      time: "05:00 PM",
      venue: "Open Air Stage",
      category: "Music",
      description: "An evening of live music and performances.",
    },
  ],
  2: [
    {
      id: 5,
      title: "Esports Championship",
      time: "09:30 AM",
      venue: "Gaming Arena",
      category: "Gaming",
      description: "Competitive gaming enters its final rounds.",
    },
    {
      id: 6,
      title: "Cosplay Showcase",
      time: "12:00 PM",
      venue: "Main Stage",
      category: "Comic Con",
      description: "Showcase your favourite characters.",
    },
    {
      id: 7,
      title: "Robotics Showdown",
      time: "02:30 PM",
      venue: "Technical Arena",
      category: "Technology",
      description: "Robotics teams compete in an exciting showdown.",
    },
    {
      id: 8,
      title: "Star Night",
      time: "06:00 PM",
      venue: "Open Air Stage",
      category: "Entertainment",
      description: "The evening's headline performance.",
    },
  ],
  3: [
    {
      id: 9,
      title: "Gaming Finals",
      time: "10:00 AM",
      venue: "Gaming Arena",
      category: "Gaming",
      description: "The final battle for the championship.",
    },
    {
      id: 10,
      title: "Tech Exhibition",
      time: "12:00 PM",
      venue: "Exhibition Hall",
      category: "Technology",
      description: "Explore innovative student projects.",
    },
    {
      id: 11,
      title: "Prize Distribution",
      time: "04:00 PM",
      venue: "Main Auditorium",
      category: "Ceremony",
      description: "Celebrate the winners and participants.",
    },
    {
      id: 12,
      title: "Closing Ceremony",
      time: "06:00 PM",
      venue: "Main Stage",
      category: "Ceremony",
      description: "The final lap of the festival.",
    },
  ],
};

export default function RaceSchedulePage() {
  const [activeDay, setActiveDay] = useState(1);
  const [selected, setSelected] = useState(0);

  const events = schedule[activeDay];
  const selectedEvent = events[selected];

  return (
    <main className={styles.page}>
      {/* HERO */}
      <section className={styles.hero}>
        <nav className={styles.navbar}>
          <div className={styles.logo}>
            <span>Y</span>UVAAN <small>2K27</small>
          </div>

          <div className={styles.navRight}>
            <span>IIIT GUWAHATI</span>
            <span className={styles.live}>
              <i /> EVENT SCHEDULE
            </span>
          </div>
        </nav>

        <div className={styles.heroContent}>
          <p className={styles.eyebrow}>
            THE ULTIMATE CAMPUS EXPERIENCE
          </p>

          <h1>
            START YOUR
            <br />
            <span>ENGINES.</span>
          </h1>

          <p className={styles.description}>
            Three days. Countless experiences.
            One unforgettable ride.
          </p>

          <a href="#schedule" className={styles.cta}>
            EXPLORE THE SCHEDULE <span>↗</span>
          </a>
        </div>

        <div className={styles.heroDecoration}>
          <span>LIGHTS OUT</span>
          <span>AND AWAY WE GO!</span>
        </div>

        <div className={styles.trackSection}>
          <div className={styles.trackHeader}>
            <span>01 / THE CIRCUIT</span>
            <span>INTERACTIVE 3D EXPERIENCE</span>
          </div>

          <RaceTrackScene
            events={events}
            selected={selected}
            onSelect={setSelected}
          />

          <div className={styles.trackFooter}>
            <span>● CHECKPOINTS</span>
            <span>● SELECT AN EVENT</span>
            <span>● EXPLORE THE RACE</span>
          </div>
        </div>
      </section>

      {/* SCHEDULE */}
      <section id="schedule" className={styles.schedule}>
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.eyebrow}>YOUR RACE WEEKEND</p>
            <h2>THE <span>LINEUP.</span></h2>
          </div>

          <p>
            Choose your day.
            Find your next destination.
          </p>
        </div>

        <div className={styles.daySelector}>
          {[1, 2, 3].map((day) => (
            <button
              key={day}
              onClick={() => {
                setActiveDay(day);
                setSelected(0);
              }}
              className={
                activeDay === day ? styles.activeDay : ""
              }
            >
              <span>DAY 0{day}</span>
              <small>
                {["FRIDAY", "SATURDAY", "SUNDAY"][day - 1]}
              </small>
            </button>
          ))}
        </div>

        <div className={styles.eventList}>
          {events.map((event, index) => (
            <button
              key={event.id}
              className={`${styles.event} ${
                selected === index ? styles.selectedEvent : ""
              }`}
              onClick={() => setSelected(index)}
            >
              <div className={styles.eventNumber}>
                {String(index + 1).padStart(2, "0")}
              </div>

              <div className={styles.eventInfo}>
                <span className={styles.category}>
                  {event.category}
                </span>

                <h3>{event.title}</h3>
                <p>{event.description}</p>
              </div>

              <div className={styles.eventMeta}>
                <strong>{event.time}</strong>
                <span>{event.venue}</span>
              </div>

              <div className={styles.arrow}>↗</div>
            </button>
          ))}
        </div>

        {selectedEvent && (
          <div className={styles.selectedInfo}>
            <div>
              <span>YOUR SELECTED CHECKPOINT</span>
              <h3>{selectedEvent.title}</h3>
            </div>

            <div>
              <strong>{selectedEvent.time}</strong>
              <p>{selectedEvent.venue}</p>
            </div>
          </div>
        )}
      </section>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <div className={styles.footerLogo}>
          YUVAAN <span>2K27</span>
        </div>

        <p>THREE DAYS. ONE EPIC RIDE.</p>

        <span>IIIT GUWAHATI · 2027</span>
      </footer>
    </main>
  );
}
