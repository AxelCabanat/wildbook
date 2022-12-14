import datasource from "../db";
import Grade from "../entity/Grade";
import Skill from "../entity/Skill";
import Wilder from "../entity/Wilder";
import { IController } from "../type/iController";

const wildersController: IController = {
  create: async (req, res) => {
    const { name, city, bio } = req.body;
    if (name.length > 100 || name.length === 0) {
      return res
        .status(422)
        .send("the name should have a length between 1 and 100 characters");
    }

    try {
      const created = await datasource
        .getRepository(Wilder)
        .save({ name, city, bio });
      res.status(201).send(created);
    } catch (err) {
      console.error(err);
      res.send("error while creating wilder");
    }
  },
  read: async (req, res) => {
    try {
      const wilders = await datasource
        .getRepository(Wilder)
        .find({ relations: { grades: { skill: true } } });
      // const wilders = await datasource.getRepository(Wilder).query('SELECT * FROM wilder');
      res.send(
        wilders.map((w) => ({
          ...w,
          grades: undefined,
          skills: w.grades.map((g) => ({
            id: g.skill.id,
            name: g.skill.name,
            vote: g.votes,
          })),
        }))
      );
    } catch (err) {
      console.error(err);
      res.send("error while reading wilders");
    }
  },

  readOneById: async (req, res) => {
    try {
      const wilder = await datasource.getRepository(Wilder).findOne({
        where: { id: parseInt(req.params.id, 10) },
        relations: { grades: { skill: true } },
      });
      if (wilder !== null)
        res.send({
          ...wilder,
          grades: undefined,
          skills: wilder?.grades.map((g) => ({
            id: g.skill.id,
            name: g.skill.name,
            vote: g.votes,
          })),
        });
      else res.status(404).send("Wilder not found");
    } catch (err) {
      console.error(err);
      res.send("error while reading wilder");
    }
  },
  update: async (req, res) => {
    const { name } = req.body;
    if (name.length > 100 || name.length === 0) {
      return res
        .status(422)
        .send("the name should have a length between 1 and 100 characters");
    }

    try {
      const { affected } = await datasource
        .getRepository(Wilder)
        .update(req.params.id, req.body);
      if (affected === 1) return res.send("wilder updated");
      res.sendStatus(404);
    } catch (err) {
      console.error(err);
      res.send("error while updating wilder");
    }
  },
  delete: async (req, res) => {
    try {
      const { affected } = await datasource
        .getRepository(Wilder)
        .delete(req.params.id);
      if (affected !== 0) return res.send("wilder deleted");
      res.sendStatus(404);
    } catch (err) {
      console.error(err);
    }
  },

  addSkill: async (req, res) => {
    const wilderToUpdate = await datasource
      .getRepository(Wilder)
      .findOneBy({ id: parseInt(req.params.wilderId, 10) });

    if (wilderToUpdate === null)
      return res.status(404).send("wilder not found");

    const skillToAdd = await datasource
      .getRepository(Skill)
      .findOneBy({ id: req.body.skillId });

    if (skillToAdd === null) return res.status(404).send("skill not found");

    await datasource.getRepository(Grade).insert({
      wilder: wilderToUpdate,
      skill: skillToAdd,
    });

    res.send("skill added to wilder");
  },
  removeSkill: async (req, res) => {
    const wilderToUpdate = await datasource
      .getRepository(Wilder)
      .findOneBy({ id: parseInt(req.params.wilderId, 10) });

    if (wilderToUpdate === null)
      return res.status(404).send("wilder not found");

    const skillToRemove = await datasource
      .getRepository(Skill)
      .findOneBy({ id: parseInt(req.params.skillId, 10) });

    if (skillToRemove === null) return res.status(404).send("skill not found");

    await datasource
      .getRepository(Grade)
      .delete({ wilderId: wilderToUpdate.id, skillId: skillToRemove.id });
    res.send("skill deleted from wilder");
  },
};

export default wildersController;
