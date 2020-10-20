import React, {useState, useEffect} from 'react';

export const TestPage = () => {

    const [initialState, setInitialState] = useState([]);

    const getJobs = async () => {
        const response = await fetch(
            `https://api.resumatorapi.com/v1/jobs?apikey=${process.env.GATSBY_JAZZHRAPI}`
        );
        const body = await response.json();
    
        if (response.status !== 200) {
            throw Error(body.message);
        }
        console.log('body', body)
        return body;
      };
    

    useEffect(() => {
        getJobs()
            .then(res => {
                const openJobs = res.filter(
                    job =>
                        job.send_to_job_boards === 'Yes' &&
                        job.status === 'Open'
                );
                setInitialState(openJobs);
            })
            .catch(err => console.log(err));
    }, [])

    console.log({initialState})
    
    return (
        <section className="section section--gradient">
            <div className="container">
                <div className="columns">
                    <div className="column is-10 is-offset-1">
                        <div className="section">
                            <h2 className="title is-size-3 has-text-weight-bold is-bold-light">
                                title
                            </h2>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default TestPage;
