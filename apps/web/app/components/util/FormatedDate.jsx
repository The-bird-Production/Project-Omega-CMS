export default function FormatedDate ({rowDate}) {

    const date = new Date(rowDate)

    const formattedDate = date.toLocaleString("fr-FR", {
        weekday: "long",   // Exemple : mercredi
        year: "numeric",   // Exemple : 2024
        month: "long",     // Exemple : décembre
        day: "numeric",    // Exemple : 4
        hour: "2-digit",   // Exemple : 18
        minute: "2-digit", // Exemple : 43
        timeZone: "Europe/Paris", // Facultatif selon votre timezone
    });

    return (
        <>
        {formattedDate}
        </>
    )

}