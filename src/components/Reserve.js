/* global gapi, google */ // Informer ESLint que gapi et google sont définis globalement
import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

const CLIENT_ID = "100174910445-i34qd8f9l36pipfd4cce62jhm1u3be8h.apps.googleusercontent.com";
const SCOPES = "https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar";

function Reserve() {
  const [events, setEvents] = useState([]); // Événements affichés
  const [error, setError] = useState(null); // Messages d'erreur
  const [token, setToken] = useState(null); // Token Google
  const [selectedRoom, setSelectedRoom] = useState(""); // Salle sélectionnée
  const [availableTimes, setAvailableTimes] = useState([]); // Horaires disponibles
  const [formData, setFormData] = useState({
    date: "",
    time: "",
    email: "",
  });

  const rooms = [
    { id: "room10", name: "Salle 10", times: ["09:00", "10:00", "11:00"] },
    { id: "room20", name: "Salle 20", times: ["12:00", "13:00", "14:00"] },
  ];

  // Initialiser Google API et charger les événements
  useEffect(() => {
    const initializeGoogleAPI = () => {
      if (typeof google === "undefined" || typeof gapi === "undefined") {
        console.error("Google API scripts are not loaded yet. Retrying...");
        setTimeout(initializeGoogleAPI, 500);
        return;
      }

      console.log("Google API scripts are loaded.");

      const tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: (response) => {
          if (response.access_token) {
            setToken(response.access_token);
            loadEvents(response.access_token);
          } else {
            setError("Impossible d'obtenir un token Google.");
          }
        },
      });

      tokenClient.requestAccessToken();
    };

    initializeGoogleAPI();
  }, []);

  // Charger les événements à partir de Google Calendar
  const loadEvents = (accessToken) => {
    gapi.load("client", () => {
      gapi.client
        .init({
          apiKey: "", // Pas nécessaire si un accessToken est utilisé
          clientId: CLIENT_ID,
          scope: SCOPES,
        })
        .then(() => {
          return gapi.client.request({
            path: "https://www.googleapis.com/calendar/v3/calendars/primary/events",
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });
        })
        .then((response) => {
          console.log("Google Calendar events:", response.result.items);
          const formattedEvents = response.result.items.map((event) => ({
            title: event.summary,
            start: event.start.dateTime,
            end: event.end.dateTime,
          }));
          setEvents(formattedEvents);
        })
        .catch((error) => {
          console.error("Erreur lors du chargement des événements :", error);
          setError("Impossible de charger les événements.");
        });
    });
  };

  // Ajouter une réservation à Google Calendar
  const addReservationToGoogleCalendar = (reservation) => {
    if (!token) {
      setError("Vous devez être connecté pour ajouter une réservation.");
      return;
    }

    gapi.client
      .request({
        path: "https://www.googleapis.com/calendar/v3/calendars/primary/events",
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          summary: `Salle ${reservation.room_id} - Réservé par ${reservation.email}`,
          start: { dateTime: reservation.start_time, timeZone: "UTC" },
          end: { dateTime: reservation.end_time, timeZone: "UTC" },
        }),
      })
      .then(() => {
        setEvents((prevEvents) => [
          ...prevEvents,
          {
            title: `Salle ${reservation.room_id} - Réservé par ${reservation.email}`,
            start: reservation.start_time,
            end: reservation.end_time,
          },
        ]);
        alert("Réservation confirmée et ajoutée au Google Calendar.");
      })
      .catch((error) => {
        console.error("Erreur lors de l'ajout de la réservation :", error);
        setError("Impossible d'ajouter la réservation.");
      });
  };

  const handleRoomChange = (e) => {
    const room = rooms.find((r) => r.id === e.target.value);
    setSelectedRoom(room.id);
    setAvailableTimes(room.times);
  };

  const handleReservation = (e) => {
    e.preventDefault();

    const newReservation = {
      room_id: selectedRoom,
      email: formData.email,
      start_time: `${formData.date}T${formData.time}:00`,
      end_time: `${formData.date}T${parseInt(formData.time.split(":")[0]) + 1}:00:00`,
    };

    // Ajouter directement à Google Calendar
    addReservationToGoogleCalendar(newReservation);

    // Réinitialiser le formulaire
    setFormData({ date: "", time: "", email: "" });
  };

  const handleReconnect = () => {
    const tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: (response) => {
        if (response.access_token) {
          setToken(response.access_token);
          loadEvents(response.access_token);
        } else {
          setError("Impossible de se reconnecter à Google.");
        }
      },
    });
    tokenClient.requestAccessToken();
  };

  return (
    <div>
      <h1>Réservations de salles</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <button onClick={handleReconnect}>Réessayer</button>
      <form onSubmit={handleReservation}>
        <label>Salle : </label>
        <select onChange={handleRoomChange} value={selectedRoom} required>
          <option value="" disabled>
            Sélectionnez une salle
          </option>
          {rooms.map((room) => (
            <option key={room.id} value={room.id}>
              {room.name}
            </option>
          ))}
        </select>
        <label>Date : </label>
        <input
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          required
        />
        <label>Heure : </label>
        <select
          value={formData.time}
          onChange={(e) => setFormData({ ...formData, time: e.target.value })}
          required
        >
          <option value="" disabled>
            Sélectionnez une heure
          </option>
          {availableTimes.map((time) => (
            <option key={time} value={time}>
              {time}
            </option>
          ))}
        </select>
        <label>Email : </label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
        <button type="submit">Réserver</button>
      </form>

      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={events}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,dayGridWeek,dayGridDay",
        }}
      />
    </div>
  );
}

export default Reserve;
