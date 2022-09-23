import React, { useEffect, useState } from 'react';
import styles from "./SkillButton.module.css"

const SkillButton = ({id, name, processing, setProcessing, selectedSkills, setSelectedSkills}) => {
    const [selected, setSelected] = useState(selectedSkills.includes(id));

    const handleSkillClic = async (e) => {
        e.preventDefault();
        await setProcessing(true);
            
        try {
            if (selectedSkills.includes(id)){
                await setSelectedSkills(selectedSkills.filter((skillId) => skillId!==id))
            } else {
                await setSelectedSkills(current => [...current, id])
            }
        } catch (err) {
            console.log(err)
        } finally {
            setProcessing(false)
        }  
    }

        useEffect(()=>{
            setSelected(selectedSkills.includes(id))
        },[selectedSkills, id])

    return (
        <button className={selected && styles.selected} disabled={processing} onClick={(e) => handleSkillClic(e)}>
            {name}
        </button>
    );
};

export default SkillButton;