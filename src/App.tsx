
import { useState } from "react";
import RaceTrackScene from "./components/RaceTrack";
import "./App.css";

type Event = {
  time: string;
  title: string;
  venue: string;
  category: string;
  description: string;
};

const schedule: Record<string, Event[]> = {
  "DAY 01": [
    {
      time: "09:00 AM",
      title: "Grand Inauguration",
      venue: "Main Auditorium",
      category: "CEREMONY",
      description: "Kick off the festival with the opening ceremony.",
    },
    {
      time: "11:00 AM",
      title: "HackQuest",
      venue: "Computer Centre",
      category: "TECHNICAL",
      description: "A competitive coding and problem-solving challenge.",
    },
    {
      time: "02:00 PM",
      title: "Cosplay Registration",
      venue: "Central Lawn",
      category: "CULTURAL",
      description: "Registration and preparation for the cosplay event.",
    },
    {
      time: "05:00 PM",
      title: "Battle of Bands",
      venue: "Open Air Stage",
      category: "MUSIC",
      description: "A live musical showdown featuring student bands.",
    },
  ],

  "DAY 02": [
    {
      time: "09:30 AM",
      title: "Robo Wars",
      venue: "Workshop Arena",
      category: "TECHNICAL",
      description: "Watch student-built robots compete in the arena.",
    },
    {
      time: "12:00 PM",
      title: "Esports Championship",
      venue: "Gaming Zone",
      category: "GAMING",
      description: "Teams compete for the gaming championship.",
    },
    {
      time: "03:00 PM",
      title: "Dance Showdown",
      venue: "Open Air Stage",
      category: "CULTURAL",
      description: "A high-energy dance competition.",
    },
    {
      time: "06:00 PM",
      title: "Star Night",
      venue: "Main Ground",
      category: "LIVE SHOW",
      description: "The headline performance of the festival.",
    },
  ],

  "DAY 03": [
    {
      time: "10:00 AM",
      title: "Startup Showcase",
      venue: "Seminar Hall",
      category: "TECHNICAL",
      description: "Explore innovative student projects and startups.",
    },
    {
      time: "12:30 PM",
      title: "Treasure Hunt",
      venue: "Campus",
      category: "FUN",
      description: "Solve clues and explore the campus with your team.",
    },
    {
      time: "03:00 PM",
      title: "Final Showdown",
      venue: "Main Ground",
      category: "FINALS",
      description: "The final round of the festival competitions.",
    },
    {
      time: "06:00 PM",
      title: "Closing Ceremony",
      venue: "Main Auditorium",
      category: "CEREMONY",
      description: "Celebrate the winners and close the festival.",
    },
  ],
};

const days = Object.keys(schedule);

function App() {
  const [activeDay, setActiveDay] = useState("DAY 01");
  const [selectedEvent, setSelectedEvent] = useState(0);

  const events = schedule[activeDay];
  const currentEvent = events[selectedEvent];

  function changeDay(day: string) {
    setActiveDay(day);
    setSelectedEvent(0);
  }

  return (
    <main className="page">
      <nav className="navbar">
        <a className="brand" href="#">
          YUVAAN<span> 2K27</span>
        </a>

        <div className="nav-status">
          <span className="status-dot" />
          THE FESTIVAL IS ON
        </div>

        <a className="nav-link" href="#schedule">
          EXPLORE SCHEDULE ↗
        </a>
      </nav>

      <section className="hero">
        <div className="hero-content">
          <p className="eyebrow">
            <span /> THE ULTIMATE CAMPUS FESTIVAL
          </p>

          <h1>
            START YOUR
            <br />
            <span>ENGINES.</span>
          </h1>

          <p className="hero-description">
            Three days. Countless events. One unforgettable ride.
            Find your events and get ready for the action.
          </p>

          <a className="hero-button" href="#schedule">
            VIEW THE SCHEDULE <span>↓</span>
          </a>
        </div>

        <div className="hero-number">
          <span>EDITION</span>
          <strong>027</strong>
        </div>
      </section>

      {/* SCHEDULE */}
      <section className="schedule-section" id="schedule">
        <div className="section-heading schedule-heading">
          <div>
            <p className="eyebrow">PIT STOP / EVENT DETAILS</p>
            <h2>THE SCHEDULE</h2>
          </div>

          <p className="schedule-note">
            PICK YOUR DAY. FIND YOUR RACE.
          </p>
        </div>

        <div className="day-selector">
          {days.map((day, index) => (
            <button
              key={day}
              className={
                activeDay === day
                  ? "day-button active"
                  : "day-button"
              }
              onClick={() => changeDay(day)}
            >
              <span>0{index + 1}</span>
              {day}
              {activeDay === day && <i />}
            </button>
          ))}
        </div>

        <div className="schedule-layout">
          <div className="event-list">
            {events.map((event, index) => (
              <button
                key={`${activeDay}-${event.title}`}
                className={
                  selectedEvent === index
                    ? "event-card selected"
                    : "event-card"
                }
                onClick={() => setSelectedEvent(index)}
              >
                <div className="event-time">
                  {event.time}
                </div>

                <div className="event-info">
                  <span className="event-category">
                    {event.category}
                  </span>

                  <h3>{event.title}</h3>
                  <p>{event.venue}</p>
                </div>

                <div className="event-arrow">
                  {selectedEvent === index ? "●" : "↗"}
                </div>
              </button>
            ))}
          </div>

          <aside className="event-details">
            <div className="details-top">
              <span>NOW SELECTED</span>

              <span className="details-number">
                0{selectedEvent + 1} / 0{events.length}
              </span>
            </div>

            <div className="details-content">
              <p className="eyebrow">
                {currentEvent.category}
              </p>

              <h3>{currentEvent.title}</h3>

              <p className="details-description">
                {currentEvent.description}
              </p>

              <div className="details-divider" />

              <div className="detail-row">
                <span>DATE</span>
                <strong>{activeDay}</strong>
              </div>

              <div className="detail-row">
                <span>TIME</span>
                <strong>{currentEvent.time}</strong>
              </div>

              <div className="detail-row">
                <span>VENUE</span>
                <strong>{currentEvent.venue}</strong>
              </div>
            </div>

            <div className="details-footer">
              <span>YUVAAN 2K27</span>
              <span>RACE TO THE FINISH.</span>
            </div>
          </aside>
        </div>
      </section>

      {/* 3D CIRCUIT BELOW THE SCHEDULE */}
      <section className="track-section" id="circuit">
        <div className="section-heading">
          <div>
            <p className="eyebrow">THE DAY-SPECIFIC CIRCUIT</p>
            <h2>{activeDay} / THE RACEWAY</h2>
          </div>

          <div className="track-legend">
            <span>
              <i className="legend-red" /> CHECKPOINT
            </span>

            <span>
              <i className="legend-yellow" /> CURRENT EVENT
            </span>
          </div>
        </div>

        <div className="track-frame">
          <div className="track-top-label">
            <span>YUVAAN GRAND PRIX</span>
            <span>{activeDay} / LIVE 3D CIRCUIT</span>
          </div>

          <RaceTrackScene
            key={activeDay}
            day={activeDay}
            events={events}
            selected={selectedEvent}
            onEventChange={setSelectedEvent}
          />

          <div className="track-bottom-label">
            <span>LIGHTNING MODE / CONTINUOUS LAPS</span>
            <span>FOLLOW THE CHECKPOINTS ↗</span>
          </div>
        </div>
      </section>

      <footer className="footer">
        <a className="brand" href="#">
          YUVAAN<span> 2K27</span>
        </a>

        <p>BUILT FOR THE THRILL. MADE FOR THE MEMORIES.</p>

        <span>© 2027 YUVAAN</span>
      </footer>
    </main>
  );
}

export default App;
