const express = require("express");
const fs = require("fs");
const cors = require("cors");
const app = express();
const port = 3000;

const corsOptions = {
  origin: "http://localhost:4200",
  optionsSuccessStatus: 204,
  methods: "GET, POST, DELETE",
};
app.use(cors(corsOptions));
app.use(express.json());

app.get("/cines", (req, res) => {
  const page = parseInt(req.query.page) || 0;
  const perPage = parseInt(req.query.perPage) || 10;

  fs.readFile("db.json", "utf8", (err, data) => {
    if (err) {
      console.log(err);
      res.status(500).send("Internal Server Error");
      return;
    }

    const jsonData = JSON.parse(data);

    const start = page * perPage;
    const end = start + perPage;

    const result = jsonData.cines.slice(start, end);

    res.status(200).json({
      cines: result,
      total: jsonData.cines.length,
      page,
      perPage,
      totalPages: Math.ceil(jsonData.cines.length / perPage),
    });
  });
});
app.post("/cines", (req, res) => {
  const { nombre, encuentra, coordenadas, direccion, imagen, llegar, mapa, paginaweb, peliculas, sesiones, telefono, valoracion } = req.body;

  fs.readFile("db.json", "utf8", (err, data) => {
    if (err) {
      console.log(err);
      res.status(500).send("Internal Server Error");
      return;
    }
    const jsonData = JSON.parse(data);

    const maxId = jsonData.cines.reduce(
      (max, cines) => Math.max(max, cines.id),
      0
    );
    const newCine = {
      id: maxId + 1,
      nombre,
      encuentra,
      coordenadas,
      direccion,
      imagen,
      llegar,
      mapa,
      paginaweb,
      peliculas,
      sesiones,
      telefono,
      valoracion
    }

    jsonData.cines.push(newCine);

    fs.writeFile("db.json", JSON.stringify(jsonData), (err) => {
      if (err) {
        console.log(err);
        res.status(500).send("Internal Server Error");
        return;
      }
      res.status(201).json(nuevoUsuario);
    });
  });
});

app.delete("/cines/:id", (req, res) => {
  const id = parseInt(req.params.id);

  fs.readFile("db.json", "utf8", (err, data) => {
    if (err) {
      console.log(err);
      res.status(500).send("Internal Server Error");
      return;
    }

    const jsonData = JSON.parse(data);
    const cineIndex = jsonData.cines.findIndex(cine => cine.id === id);

    if (cineIndex === -1) {
      res.status(404).json({ message: "Cine no encontrado" });
      return;
    }

    jsonData.cines.splice(cineIndex, 1);
    
    json.cines = jsonData.cines.map((cine, index) => {
      return { ...cine, id: index + 1 };
    });

    fs.writeFile("db.json", JSON.stringify(jsonData), (err) => {
      if (err) {
        console.log(err);
        res.status(500).json({ message: "Internal Server Error" });
        return;
      }
      res.status(200).json({ message: "Cine eliminado con éxito" });
    });
  });
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
