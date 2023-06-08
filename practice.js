// (useQueryClient and useMutation ) for add, update, delete 
// onSuccess
// handleSubmit
// FormData
// mutation.mutate()
// Object.fromEntries(formData)
// useQuery
// queryKey
// queryFn
// retry
{/* <QueryClientProvider client={queryClient}> */}
// axiosSecure 


const addPost =  async(data) => {
    const responst = axios.post('api link', data)
    return responst.data
}

const queryClient = useQueryclient();
const mutation = useMutaion(addPost, )
