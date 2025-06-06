const connection = require('../data/db');

//index properties
function index(req, res) {
    let sql = 'SELECT properties.*, AVG(reviews.vote) AS avg_vote FROM properties LEFT JOIN reviews ON properties.id = reviews.property_id'

    let arrayProperties = []

    if (req.query.city) {
        sql += ` WHERE city LIKE '%${req.query.city}%' `
    }


    sql += ' GROUP BY properties.id ORDER BY properties.heart DESC'

    connection.query(sql, (err, properties) => {
        if (err) {
            res.status(500).json({ message: err.message })
            return
        }

        arrayProperties = [...properties]

        if (req.query.room) {
            arrayProperties = arrayProperties.filter((property, index) => property.room >= req.query.room)
        }

        if (req.query.bed) {
            arrayProperties = arrayProperties.filter((property, index) => property.bed >= req.query.bed)
        }

        if (req.query.type) {
            arrayProperties = arrayProperties.filter((property, index) => property.type === req.query.type)
        }

        if (req.query.toilet) {
            arrayProperties = arrayProperties.filter((property, index) => property.toilet >= req.query.toilet)
        }

        if (req.query.limit) {
            arrayProperties = arrayProperties.filter((property, index) => index < req.query.limit)
        }

        res.json(arrayProperties)
    })


}


//show property
function show(req, res) {

    let id = req.params.id

    if (isNaN(id)) {
        id = id.trim().replaceAll('-', ' ')
    }

    const sql = `SELECT properties.*, AVG(vote) AS avg_vote 
		FROM properties
		LEFT JOIN reviews
		ON properties.id = reviews.property_id 
		WHERE properties.title = ?
		GROUP BY properties.id
    `

    connection.query(sql, [id], (err, results) => {
        if (err) return res.status(500).json({ message: err.message })
        if (results.length === 0)
            return res.status(404).json({
                error: 'Not Found',
                message: 'Property not found',
            })

        const property = results[0]
        // movie.image = `http://localhost:3000/movies_cover/${movie.image}`

        id = property.id

        const sql = `SELECT reviews.title, reviews.created_at, reviews.days_of_stays,
         reviews.vote, users.username, reviews.id,
         reviews.text  FROM reviews 
        JOIN users ON users.id = reviews.user_id
        WHERE property_id = ?`

        connection.query(sql, [id], (err, results) => {
            if (err) return res.status(500).json({ message: err.message })

            property.reviews = results
            res.json(property)
        })

    })
}

function storeProperty(req, res) {

    const user_id = req.params.id

    const {
        title,
        description,
        room,
        bed,
        toilet,
        square_meter,
        address,
        city,
        province,
        image,
        type,
        price,
        distance_centre,
        swim,
        tv,
        animals,
        high_chair,
        cleaner,
        heating,
        air_conditioning,
        essential,
        gym,
        courtyard,
        washing_machine,
        parking
    } = req.body


    if (
        !title ||
        !description ||
        isNaN(room) ||
        isNaN(bed) ||
        isNaN(toilet) ||
        isNaN(square_meter) ||
        !address ||
        !city ||
        !province ||
        !image ||
        isNaN(price) ||
        isNaN(distance_centre)

    ) {
        return res.status(400).json({ message: 'Invalid data' })
    }

    const sql = `INSERT INTO properties (
        user_id,
        title,
        description,
        room,
        bed,
        toilet,
        square_meter,
        address,
        city,
        province,
        image,
        type,
        price,
        distance_centre,
        swim,
        tv,
         animals,
        high_chair,
        cleaner,
        heating,
        air_conditioning,
        essential,
        gym,
        courtyard,
        washing_machine,
        parking) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?, ?, ?,?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`

    connection.query(sql, [
        user_id,
        title,
        description,
        room,
        bed,
        toilet,
        square_meter,
        address,
        city,
        province,
        image,
        type,
        price,
        distance_centre,
        swim,
        tv,
        animals,
        high_chair,
        cleaner,
        heating,
        air_conditioning,
        essential,
        gym,
        courtyard,
        washing_machine,
        parking
    ], (err, results) => {
        if (err) return res.status(500).json({ message: err.message })
        res.status(201).json({ message: 'Property created' })
    })
}


function storeReview(req, res) {
    const property_id = req.params.id
    const {
        user_id,
        title,
        text,
        days_of_stays,
        vote
    } = req.body

    if (
        !user_id ||
        !title ||
        !days_of_stays ||
        !vote ||
        !property_id
    ) {
        return res.status(400).json({ message: 'Invalid data' })
    }

    const sql = `INSERT INTO reviews (property_id, user_id, title, text, days_of_stays, vote) VALUES (?, ?, ?, ?, ?, ?)`

    connection.query(sql, [
        property_id,
        user_id,
        title,
        text,
        days_of_stays,
        vote], (err, results) => {
            if (err) return res.status(500).json({ message: err.message })
            res.status(201).json({ message: 'Review created' })
        })

}


function modifyHeart(req, res) {

    const id = req.params.id

    let heart = 0

    let sql = `SELECT properties.heart FROM properties WHERE id = ?`

    connection.query(sql, [id], (err, results) => {
        if (err) return res.status(500).json({ message: err.message })
        heart = parseInt(results[0].heart) + 1
        // console.log(results[0].heart, heart);
        sql = `UPDATE bnb_db.properties SET heart = ${heart} WHERE (id = ${id})`
        connection.query(sql, (err, results) => {
            if (err) return res.status(500).json({ message: err.message })
            res.status(203).json({ message: 'Added heart' })
        })


    })
}
module.exports = { index, show, storeProperty, storeReview, modifyHeart }