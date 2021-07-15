using System;
using System.Globalization;
using Umbraco.Core.Models;
using Umbraco.Web;
using Umbraco.Web.Models;

namespace Jahan.Handicraft.Model.UModel.URenderModel
{
    public class BaseRenderModel<TBaseEntity> : RenderModel where TBaseEntity : BaseEntity
    {

        public TBaseEntity Model { get; set; }
        public BaseRenderModel(IPublishedContent content, CultureInfo culture) : base(content, culture)
        {
            object[] args = new object[] { content, culture };
            Model = (TBaseEntity)Activator.CreateInstance(typeof(TBaseEntity), args);
        }

        public BaseRenderModel(IPublishedContent content) : base(content)
        {
            object args = new object[] { content };
            Model = (TBaseEntity)Activator.CreateInstance(typeof(TBaseEntity), args);
        }

        public BaseRenderModel()
            : base(UmbracoContext.Current.PublishedContentRequest.PublishedContent)
        {

        }
    }

    //private TRenderModel Instance<TRenderModel>(IPublishedContent content, CultureInfo culture) where TRenderModel : BaseRenderModel<TBaseEntity>
    //{
    //    TRenderModel instance = null;
    //    if (content != null)
    //    {
    //        object[] args = null;
    //        if (culture != null)
    //        {
    //            args = new object[] { content, culture };
    //        }
    //        else
    //        {
    //            args = new object[] { content };
    //        }
    //        instance = (TRenderModel)Activator.CreateInstance(typeof(TRenderModel), args);
    //    }
    //    return instance;
    //}
}
