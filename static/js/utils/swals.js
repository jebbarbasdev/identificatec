//@ts-check

const Swal = globalThis.Swal

/**
 * 
 * @param {Partial<{ title: string, text: string}>} [kwargs]
 * @returns {Promise<boolean>}
 */
export async function swalQuestion(kwargs) {
    const result = await Swal.fire({
        title: kwargs?.title,
        text: kwargs?.text,

        icon: 'question',
        showCancelButton: true,
        confirmButtonText: "Yes",
        cancelButtonText: "No",
        confirmButtonColor: "var(--bs-success)",
        cancelButtonColor: "var(--bs-danger)",
    })

    return result.isConfirmed
}